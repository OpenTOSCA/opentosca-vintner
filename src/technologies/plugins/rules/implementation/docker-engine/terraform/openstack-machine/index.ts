import {ImplementationGenerator} from '#technologies/plugins/rules/implementation/types'
import {MetadataGenerated, OpenstackMachineCredentials} from '#technologies/plugins/rules/implementation/utils'

const generator: ImplementationGenerator = {
    id: 'docker.engine::terraform::openstack.machine',
    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {...MetadataGenerated()},
            properties: {
                ...OpenstackMachineCredentials(),
                os_ssh_host: {
                    type: 'string',
                    default: {
                        eval: '.::.requirements::[.name=host]::.target::management_address',
                    },
                },
            },
            attributes: {
                application_address: {
                    type: 'string',
                    default: '127.0.0.1',
                },
            },

            interfaces: {
                Standard: {
                    operations: {
                        configure: {
                            implementation: {
                                primary: 'Terraform',
                            },
                        },
                    },
                },
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
                        delete: 'exit 0',
                    },
                },
            },
        }
    },
}

export default generator
