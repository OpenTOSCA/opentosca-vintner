import {MANAGEMENT_OPERATIONS} from '#spec/interface-definition'
import {NodeType} from '#spec/node-type'
import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    ApplicationDirectory,
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

const artifact = 'tar.archive'

const generator: ImplementationGenerator = {
    component: 'software.application',
    technology: 'terraform',
    artifact,
    hosting: ['*', 'virtual.machine'],
    weight: 0,
    reason: 'Ansible is more specialized. Also using Remote-Exec Executor is a "last resort".',

    generate: (name, type) => {
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
                                                        source: SourceArchiveFile(artifact),
                                                        destination: `/tmp/artifact-${name}`,
                                                        count: `{{ (${JinjaWhenSourceArchiveFile(
                                                            artifact
                                                        )}) | ternary(1, 0) }}`,
                                                    },
                                                    {
                                                        content: create(name, type),
                                                        destination: `/tmp/create-${name}.sh`,
                                                    },
                                                    {
                                                        content: configure(),
                                                        destination: `/tmp/configure-${name}.sh`,
                                                    },
                                                    {
                                                        content: start(),
                                                        destination: `/tmp/start-${name}.sh`,
                                                    },
                                                    {
                                                        content: stop(),
                                                        destination: `/tmp/stop-${name}.sh`,
                                                    },
                                                    {
                                                        content: del(),
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
    },
}

function create(name: string, type: NodeType) {
    return `
${BASH_HEADER}

# Create application directory
${BashCreateApplicationDirectory()}

# Create application environment
${BashCreateApplicationEnvironment(type)}

# Download deployment artifact if required
${BashDownloadSourceArchive(name, artifact)}

# Extract deployment artifact
${BashUnarchiveSourceArchiveFile(name, artifact)}

# Create vintner directory
${BashCreateVintnerDirectory()}

# Copy operation
${BashCopyOperation(MANAGEMENT_OPERATIONS.CREATE)}

# Execute operation
${BashCallOperation(MANAGEMENT_OPERATIONS.CREATE)}
`
}

function configure() {
    return `
${BASH_HEADER}

# Copy operation
${BashCopyOperation(MANAGEMENT_OPERATIONS.CONFIGURE)}

# Execute operation
${BashCallOperation(MANAGEMENT_OPERATIONS.CONFIGURE)}
`
}

function start() {
    return `
${BASH_HEADER}

# Assert operation
${BashAssertOperation(MANAGEMENT_OPERATIONS.START)}

# Copy operation
${BashCopyOperation(MANAGEMENT_OPERATIONS.START)}

# Execute operation
${BashCallOperation(MANAGEMENT_OPERATIONS.START)}
`
}

function stop() {
    return `
${BASH_HEADER}

# Assert operation
${BashAssertOperation(MANAGEMENT_OPERATIONS.STOP)}

# Copy operation
${BashCopyOperation(MANAGEMENT_OPERATIONS.STOP)}

# Execute operation
${BashCallOperation(MANAGEMENT_OPERATIONS.STOP)}
`
}

function del() {
    return `
${BASH_HEADER}

# Copy operation
${BashCopyOperation(MANAGEMENT_OPERATIONS.STOP)}

# Execute operation
${BashCallOperation(MANAGEMENT_OPERATIONS.STOP)}

# Delete application directory
${BashDeleteApplicationDirectory()}
`
}

export default generator
