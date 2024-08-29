import {MANAGEMENT_OPERATIONS} from '#spec/interface-definition'
import {NodeType} from '#spec/node-type'
import {GeneratorAbstract} from '#technologies/plugins/rules/types'
import {
    ApplicationDirectory,
    BASH_HEADER,
    BashCallOperation,
    BashCopyOperation,
    BashCreateApplicationDirectory,
    BashCreateApplicationEnvironment,
    BashCreateVintnerDirectory,
    BashDeleteApplicationDirectory,
    BashDownloadSourceArchive,
    BashUnarchiveSourceArchiveFile,
    MetadataGenerated,
    OpenstackMachineCredentials,
    OpenstackMachineHost,
    TerraformStandardOperations,
} from '#technologies/plugins/rules/utils'

export class Generator extends GeneratorAbstract {
    component = 'software.application'
    technology = 'terraform'
    artifact = 'apt.archive'
    hosting = ['*', 'virtual.machine']
    weight = 0
    reason = 'Ansible is more specialized. Also using provisioners is a "last resort".'
    details = '"file" provisioner to upload scripts and "remote-exec" to execute scripts'

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

# Run setup script 
if [[ "{{ ".artifacts::apt_package::script" | eval }}" != "" ]]; then 
    curl -fsSL {{ ".artifacts::apt_package::script" | eval }} | sudo -E bash -
fi

# Add apt key
if [[ "{{ ".artifacts::apt_package::key" | eval }}" != "" ]]; then 
    curl -1sLf {{ ".artifacts::apt_package::key" | eval }} | gpg --dearmor --yes -o /usr/share/keyrings/{{ ".artifacts::apt_package::repository" | eval }}.gpg
fi

# Add apt repository
if [[ "{{ ".artifacts::apt_package::source" | eval }}" != "" ]]; then 
    echo "deb [signed-by=/usr/share/keyrings/{{ ".artifacts::apt_package::repository" | eval }}.gpg] {{ ".artifacts::apt_package::source" | eval }}" | tee {{ ".artifacts::apt_package::repository" | eval }}
fi

# Update apt cache
apt-get update -y

# Install dependencies
if [[ "{{ ".artifacts::apt_package::dependencies" | eval }}" != "" ]]; then 
    apt-get install {{ ".artifacts::apt_package::dependencies" | eval | split(",") | map("trim") }} -y
fi

# Install package
{{ ".artifacts::apt_package::env" | eval }} apt-get install {{ ".artifacts::apt_package::file" | eval }} -y


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

# Copy operation
${BashCopyOperation(MANAGEMENT_OPERATIONS.CREATE)}

# Execute operation
${BashCallOperation(MANAGEMENT_OPERATIONS.CREATE)}
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

# Copy operation
${BashCopyOperation(MANAGEMENT_OPERATIONS.START)}

# Execute operation
${BashCallOperation(MANAGEMENT_OPERATIONS.START)}
`
    }

    private stop() {
        return `
${BASH_HEADER}

# Copy operation
${BashCopyOperation(MANAGEMENT_OPERATIONS.STOP)}

# Execute operation
${BashCallOperation(MANAGEMENT_OPERATIONS.STOP)}
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

# Uninstall package
apt-get uninstall {{ ".artifacts::apt_package::file" | eval }} -y
`
    }
}

export default new Generator()
