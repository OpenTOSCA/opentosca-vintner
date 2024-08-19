import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
    OpenstackMachineHost,
    TerraformStandardOperations,
} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    component: 'docker.engine',
    technology: 'terraform',
    hosting: ['virtual.machine'],
    weight: 0,
    comment: 'Ansible is more specialized. Also using Remote-Exec Executor is a "last resort".',

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {
                ...OpenstackMachineCredentials(),
                ...OpenstackMachineHost(),
            },
            attributes: {
                application_address: {
                    type: 'string',
                    default: '127.0.0.1',
                },
            },

            interfaces: {
                ...TerraformStandardOperations(),
                defaults: {
                    inputs: {
                        main: {
                            resource: {
                                terraform_data: {
                                    docker: [
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
                                                'remote-exec': [
                                                    {
                                                        inline: [
                                                            'curl -sSL https://get.docker.com | sudo sh',
                                                            'sudo groupadd -f docker',
                                                            'sudo usermod -aG docker {{ SELF.os_ssh_user }}',
                                                        ],
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

export default generator
