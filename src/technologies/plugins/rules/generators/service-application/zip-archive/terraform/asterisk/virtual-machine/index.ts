import {MANAGEMENT_OPERATIONS} from '#spec/interface-definition'
import {NodeType} from '#spec/node-type'
import {GeneratorAbstract} from '#technologies/plugins/rules/types'
import {
    ApplicationDirectory,
    ApplicationSystemdUnit,
    BASH_HEADER,
    BashAssertOperation,
    BashCallOperation,
    BashCopyOperation,
    BashCreateApplicationDirectory,
    BashCreateApplicationEnvironment,
    BashCreateVintnerDirectory,
    BashDeleteApplicationDirectory,
    BashDownloadSourceArchive,
    BashUnarchiveSourceArchiveFile,
    JinjaWhenSourceArchiveFile,
    MetadataGenerated,
    OpenstackMachineCredentials,
    OpenstackMachineHost,
    SourceArchiveFile,
    TerraformStandardOperations,
} from '#technologies/plugins/rules/utils'

class Generator extends GeneratorAbstract {
    component = 'service.application'
    technology = 'terraform'
    artifact = 'zip.archive'
    hosting = ['*', 'virtual.machine']
    weight = 0
    reason = 'Ansible is more specialized. Also using provisioners is a "last resort".'
    details = '"file" provisioner to upload artifacts and scripts and "remote-exec" to execute scripts'

    generate(name: string, type: NodeType) {
        return {
            derived_from: name,
            metadata: {...MetadataGenerated()},
            properties: {
                ...OpenstackMachineCredentials(),
                ...OpenstackMachineHost(),
                ...ApplicationDirectory(),
            },
            interfaces: {
                ...TerraformStandardOperations(),
                defaults: {
                    inputs: {
                        main: {
                            resource: {
                                terraform_data: {
                                    vm: [
                                        {
                                            connection: [
                                                {
                                                    host: '{{ SELF.os_ssh_host }}',
                                                    private_key: '${file("{{ SELF.os_ssh_key_file }}")}',
                                                    type: 'ssh',
                                                    user: '{{ SELF.os_ssh_user }}',
                                                },
                                            ],
                                            provisioner: {
                                                file: [
                                                    {
                                                        source: SourceArchiveFile(this.artifact),
                                                        destination: `/tmp/artifact-${name}`,
                                                        count: `{{ (${JinjaWhenSourceArchiveFile(
                                                            this.artifact
                                                        )}) | ternary(1, 0) }}`,
                                                    },
                                                    {
                                                        content: ApplicationSystemdUnit(),
                                                        default:
                                                            '/etc/systemd/system/{{ SELF.application_name }}.service',
                                                    },
                                                    {
                                                        content: this.create(name, type),
                                                        destination: `/tmp/create-${name}.sh`,
                                                    },
                                                    {
                                                        content: this.configure(),
                                                        destination: `/tmp/configure-${name}.sh`,
                                                    },
                                                    {
                                                        content: this.start(),
                                                        destination: `/tmp/start-${name}.sh`,
                                                    },
                                                    {
                                                        content: this.stop(),
                                                        destination: `/tmp/stop-${name}.sh`,
                                                    },
                                                    {
                                                        content: this.delete(),
                                                        destination: `/tmp/delete-${name}.sh`,
                                                    },
                                                ],
                                                'remote-exec': [
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
        return `
${BASH_HEADER}

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
        return `
${BASH_HEADER}

# Copy operation
${BashCopyOperation(MANAGEMENT_OPERATIONS.CONFIGURE)}

# Execute operation
${BashCallOperation(MANAGEMENT_OPERATIONS.CONFIGURE)}
`
    }

    private start() {
        return `
${BASH_HEADER}

# Assert operation
${BashAssertOperation(MANAGEMENT_OPERATIONS.START)}

# Start service 
systemctl start {{ SELF.application_name }}
`
    }

    private stop() {
        return `
${BASH_HEADER}

# Assert operation
${BashAssertOperation(MANAGEMENT_OPERATIONS.STOP)}

# Copy operation
${BashCopyOperation(MANAGEMENT_OPERATIONS.STOP)}

# Execute operation
${BashCallOperation(MANAGEMENT_OPERATIONS.STOP)}

# Stop service 
systemctl stop {{ SELF.application_name }}
`
    }

    private delete() {
        return `
${BASH_HEADER}

# Copy operation
${BashCopyOperation(MANAGEMENT_OPERATIONS.DELETE)}

# Execute operation
${BashCallOperation(MANAGEMENT_OPERATIONS.DELETE)}

# Delete application directory
${BashDeleteApplicationDirectory()}

# Delete systemd service 
rm -f /etc/systemd/system/{{ SELF.application_name }}.service

# Reload system daemon
systemctl daemon-reload
`
    }
}
