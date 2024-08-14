import {ImplementationGenerator} from '#technologies/plugins/rules/implementation/types'
import {generatedMetadata, mapProperties} from '#technologies/plugins/rules/implementation/utils'

const plugin: ImplementationGenerator = {
    id: 'container.application::terraform::docker.engine',
    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {...generatedMetadata()},
            properties: {
                os_ssh_user: {
                    type: 'string',
                    default: {
                        get_input: 'os_ssh_user',
                    },
                },
                os_ssh_key_file: {
                    type: 'string',
                    default: {
                        get_input: 'os_ssh_key_file',
                    },
                },
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
                        delete: {
                            implementation: {
                                primary: 'Terraform',
                            },
                        },
                    },
                },
                defaults: {
                    inputs: {
                        main: {
                            terraform: [
                                {
                                    required_providers: [
                                        {
                                            docker: {
                                                source: 'kreuzwerker/docker',
                                                version: '3.0.2',
                                            },
                                        },
                                    ],
                                },
                            ],
                            provider: {
                                docker: [
                                    {
                                        host: 'ssh://{{ SELF.os_ssh_user }}@{{ SELF.os_ssh_host }}:22',
                                        ssh_opts: [
                                            '-i',
                                            '{{ SELF.os_ssh_key_file }}',
                                            '-o',
                                            'IdentitiesOnly=yes',
                                            '-o',
                                            'BatchMode=yes',
                                            '-o',
                                            'UserKnownHostsFile=/dev/null',
                                            '-o',
                                            'StrictHostKeyChecking=no',
                                        ],
                                    },
                                ],
                            },
                            resource: {
                                docker_container: {
                                    application: [
                                        {
                                            env: mapProperties(type, {format: 'ini', quote: false}),
                                            image: '${docker_image.image.image_id}',
                                            name: '{{ SELF.application_name }}',
                                            network_mode: 'host',
                                        },
                                    ],
                                },
                                docker_image: {
                                    image: [
                                        {
                                            name: '{{ SELF.application_image }}',
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

export default plugin
