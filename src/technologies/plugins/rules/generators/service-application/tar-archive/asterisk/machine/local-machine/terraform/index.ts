import {MANAGEMENT_OPERATIONS} from '#spec/interface-definition'
import {NodeType} from '#spec/node-type'
import {GeneratorAbstract} from '#technologies/plugins/rules/types'
import {TerraformStandardOperations} from '#technologies/plugins/rules/utils/terraform'
import {
    ApplicationDirectory,
    ApplicationSystemdUnit,
    BASH_HEADER,
    BashAssertManagementOperation,
    BashCallManagementOperation,
    BashCopyManagementOperation,
    BashCreateApplicationDirectory,
    BashCreateApplicationEnvironment,
    BashCreateVintnerDirectory,
    BashDeleteApplicationDirectory,
    BashDownloadSourceArchive,
    BashUnarchiveSourceArchiveFile,
    JinjaWhenSourceArchiveFile,
    MetadataGenerated,
    SourceArchiveFile,
} from '#technologies/plugins/rules/utils/utils'

class Generator extends GeneratorAbstract {
    component = 'service.application'
    technology = 'terraform'
    artifact = 'tar.archive'
    hosting = ['*', 'local.machine']
    weight = 0
    reason = 'Ansible is more specialized. Also using provisioners is a "last resort".'
    details = '"local_file" module to create scripts and artifacts and "local-exec" provisioner to execute scripts.'

    generate(name: string, type: NodeType) {
        return {
            derived_from: name,
            metadata: {...MetadataGenerated()},
            properties: {
                ...ApplicationDirectory(),
            },
            interfaces: {
                ...TerraformStandardOperations(),
                defaults: {
                    inputs: {
                        main: {
                            resource: {
                                local_file: {
                                    tmp_artifact: {
                                        source: SourceArchiveFile(this.artifact),
                                        filename: `/tmp/artifact-${name}`,
                                        count: `{{ (${JinjaWhenSourceArchiveFile(this.artifact)}) | ternary(1, 0) }}`,
                                    },
                                    tmp_service: {
                                        content: ApplicationSystemdUnit(),
                                        filename: '/etc/systemd/system/{{ SELF.application_name }}.service',
                                    },
                                    tmp_create: {
                                        content: this.create(name, type),
                                        filename: `/tmp/create-${name}.sh`,
                                    },
                                    tmp_configure: {
                                        content: this.configure(),
                                        filename: `/tmp/configure-${name}.sh`,
                                    },
                                    tmp_start: {
                                        content: this.start(),
                                        filename: `/tmp/start-${name}.sh`,
                                    },
                                    tmp_stop: {
                                        content: this.stop(),
                                        filename: `/tmp/stop-${name}.sh`,
                                    },
                                    tmp_delete: {
                                        content: this.delete(),
                                        filename: `/tmp/delete-${name}.sh`,
                                    },
                                },
                                terraform_data: {
                                    local: [
                                        {
                                            depends_on: [
                                                'local_file.tmp_artifact',
                                                'local_file.tmp_service',
                                                'local_file.tmp_create',
                                                'local_file.tmp_configure',
                                                'local_file.tmp_start',
                                                'local_file.tmp_stop',
                                                'local_file.tmp_delete',
                                            ],
                                            provisioner: {
                                                'local-exec': [
                                                    {
                                                        inline: [
                                                            `sudo bash /tmp/create-${name}.sh`,
                                                            `sudo bash /tmp/configure-${name}.sh`,
                                                            `sudo bash /tmp/start-${name}.sh`,
                                                        ],
                                                    },
                                                    {
                                                        inline: [
                                                            `sudo bash /tmp/stop-${name}.sh`,
                                                            `sudo bash /tmp/delete-${name}.sh`,
                                                        ],
                                                        when: 'destroy',
                                                    },
                                                ],
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    },
                },
            },
        }
    }

    private create(name: string, type: NodeType) {
        return `${BASH_HEADER}

# Create application directory
${BashCreateApplicationDirectory()}

# Create application environment
${BashCreateApplicationEnvironment(type)}

# Download deployment artifact if required
${BashDownloadSourceArchive(name, this.artifact)}

# Extract deployment artifact
${BashUnarchiveSourceArchiveFile(name, this.artifact)}

# Create vintner directory
${BashCreateVintnerDirectory()}

# Reload systemd daemon
systemctl daemon-reload

# Enable service 
systemctl enable {{ SELF.application_name }}
`
    }

    private configure() {
        return `${BASH_HEADER}

# Copy operation
${BashCopyManagementOperation(MANAGEMENT_OPERATIONS.CONFIGURE)}

# Execute operation
${BashCallManagementOperation(MANAGEMENT_OPERATIONS.CONFIGURE)}
`
    }

    private start() {
        return `${BASH_HEADER}

# Assert operation
${BashAssertManagementOperation(MANAGEMENT_OPERATIONS.START)}

# Start service 
systemctl start {{ SELF.application_name }}
`
    }

    private stop() {
        return `${BASH_HEADER}

# Assert operation
${BashAssertManagementOperation(MANAGEMENT_OPERATIONS.STOP)}

# Copy operation
${BashCopyManagementOperation(MANAGEMENT_OPERATIONS.STOP)}

# Execute operation
${BashCallManagementOperation(MANAGEMENT_OPERATIONS.STOP)}

# Stop service 
systemctl stop {{ SELF.application_name }}
`
    }

    private delete() {
        return `${BASH_HEADER}

# Copy operation
${BashCopyManagementOperation(MANAGEMENT_OPERATIONS.DELETE)}

# Execute operation
${BashCallManagementOperation(MANAGEMENT_OPERATIONS.DELETE)}

# Delete application directory
${BashDeleteApplicationDirectory()}

# Delete systemd service 
rm -f /etc/systemd/system/{{ SELF.application_name }}.service

# Reload system daemon
systemctl daemon-reload
`
    }
}

export default new Generator()
