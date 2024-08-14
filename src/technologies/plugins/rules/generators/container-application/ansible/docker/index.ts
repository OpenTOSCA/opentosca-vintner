import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {MetadataGenerated, OpenstackMachineCredentials, mapProperties} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    id: 'container.application::ansible::docker.engine',
    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {...MetadataGenerated()},
            properties: {...OpenstackMachineCredentials()},
            attributes: {
                application_address: {
                    type: 'string',
                    default: '127.0.0.1',
                },
            },
            interfaces: {
                Standard: {
                    operations: {
                        create: {
                            implementation: {
                                primary: 'Ansible',
                                operation_host: 'HOST',
                                environment: {
                                    ANSIBLE_HOST_KEY_CHECKING: 'False',
                                },
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        {
                                            name: 'wait for ssh',
                                            wait_for_connection: null,
                                        },
                                        {
                                            name: 'start container',
                                            'community.docker.docker_container': {
                                                name: '{{ SELF.application_name }}',
                                                image: '{{ SELF.application_image }}',
                                                network_mode: 'host',
                                                env: mapProperties(type, {format: 'map'}),
                                            },
                                        },
                                    ],
                                },
                                playbookArgs: [
                                    '--become',
                                    '--key-file={{ SELF.os_ssh_key_file }}',
                                    '--user={{ SELF.os_ssh_user }}',
                                ],
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
