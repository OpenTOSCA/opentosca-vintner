import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleHostOperation,
    AnsibleHostOperationPlaybookArgs,
    AnsibleWaitForSSHTask,
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    component: 'docker.engine',
    technology: 'ansible',
    hosting: ['virtual.machine'],
    weight: 1,
    reason: 'Primary use case due to the specialization of Ansible.',
    details: '"ansible.builtin.shell", "ansible.builtin.group", and "ansible.builtin.user" tasks',

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {...OpenstackMachineCredentials()},
            interfaces: {
                Standard: {
                    operations: {
                        create: {
                            implementation: {
                                ...AnsibleHostOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        {
                                            ...AnsibleWaitForSSHTask(),
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
                                            'ansible.builtin.group': {
                                                name: 'docker',
                                            },
                                        },
                                        {
                                            name: 'add user to docker group',
                                            'ansible.builtin.user': {
                                                name: '{{ SELF.os_ssh_user }}',
                                                groups: 'docker',
                                                append: 'yes',
                                            },
                                        },
                                    ],
                                },
                                playbookArgs: [...AnsibleHostOperationPlaybookArgs()],
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
