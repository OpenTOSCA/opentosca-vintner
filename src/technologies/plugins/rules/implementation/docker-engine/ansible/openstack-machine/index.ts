import {ImplementationGenerator} from '#technologies/plugins/rules/implementation/types'
import {MetadataGenerated, OpenstackMachineCredentials} from '#technologies/plugins/rules/implementation/utils'

const generator: ImplementationGenerator = {
    id: 'docker.engine::ansible::openstack.machine',
    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {...MetadataGenerated()},
            properties: {...OpenstackMachineCredentials()},
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
                                            'ansible.builtin.shell': 'curl -sSL https://get.docker.com | sh',
                                            args: {
                                                executable: '/usr/bin/bash',
                                            },
                                        },
                                        {
                                            name: 'add docker group',
                                            'ansible.builtin.shell': 'groupadd -f docker',
                                            args: {
                                                executable: '/usr/bin/bash',
                                            },
                                        },
                                        {
                                            name: 'add user to docker group',
                                            'ansible.builtin.shell': 'usermod -aG docker {{ SELF.os_ssh_user }}',
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

export default generator
