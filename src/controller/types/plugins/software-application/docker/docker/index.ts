import {mapProperties} from '#controller/types/plugins/utils'
import {TypePlugin} from '#controller/types/types'

const plugin: TypePlugin = {
    id: 'software.application::docker::docker',
    generate: (name, type) => {
        return {
            derived_from: name,
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
            },
            attributes: {
                application_address: {
                    type: 'string',
                    default: '127.0.0.1',
                },
                application_endpoint: {
                    type: 'string',
                    default: {
                        concat: [
                            {
                                eval: '.::application_address',
                            },
                            ':',
                            {
                                eval: '.::application_port',
                            },
                        ],
                    },
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
                                            name: 'touch compose',
                                            register: 'compose',
                                            'ansible.builtin.tempfile': {
                                                suffix: '{{ SELF.application_name }}.compose.yaml',
                                            },
                                        },
                                        {
                                            name: 'create compose',
                                            'ansible.builtin.copy': {
                                                dest: '{{ compose.path }}',
                                                content: '{{ manifest | to_yaml }}',
                                            },
                                            vars: {
                                                manifest: {
                                                    services: {
                                                        application: {
                                                            container_name: '{{ SELF.application_name }}',
                                                            image: '{{ SELF.application_image }}',
                                                            network_mode: 'host',
                                                            environment: mapProperties(type, {format: 'map'}),
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                        {
                                            name: 'apply compose',
                                            'ansible.builtin.shell': 'docker compose -f {{ compose.path }} up -d\n',
                                            args: {
                                                executable: '/usr/bin/bash',
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

export default plugin
