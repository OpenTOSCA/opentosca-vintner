import {ImplementationGenerator} from '#technologies/plugins/rules/implementation/types'
import {generatedMetadata} from '#technologies/plugins/rules/implementation/utils'

const plugin: ImplementationGenerator = {
    id: 'docker.engine::ansible::openstack.machine',
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
                                            name: 'install docker',
                                            'ansible.builtin.shell':
                                                'curl -sSL https://get.docker.com | sh\nsudo groupadd -f docker\nsudo usermod -aG docker {{ SELF.os_ssh_user }}\n',
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
