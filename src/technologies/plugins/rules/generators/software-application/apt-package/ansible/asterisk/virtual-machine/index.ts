import {MANAGEMENT_OPERATIONS} from '#spec/interface-definition'
import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleCallOperationTask,
    AnsibleCopyOperationTask,
    AnsibleCreateApplicationDirectoryTask,
    AnsibleDeleteApplicationDirectoryTask,
    AnsibleHostOperation,
    AnsibleHostOperationPlaybookArgs,
    AnsibleWaitForSSHTask,
    ApplicationDirectory,
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    component: 'software.application',
    technology: 'ansible',
    artifact: 'apt.package',
    hosting: ['*', 'virtual.machine'],
    weight: 1,
    reason: 'Primary use case due to the specialization of Ansible.',
    details:
        '"ansible.builtin.shell", "ansible.builtin.apt_key", "ansible.builtin.apt_repository", "ansible.builtin.apt", and "ansible.builtin.copy", tasks with "when" statements',

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {
                ...OpenstackMachineCredentials(),
                ...ApplicationDirectory(),
            },
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
                                            name: 'run setup script',
                                            'ansible.builtin.shell':
                                                'curl -fsSL {{ ".artifacts::apt_package::script" | eval }} | sudo -E bash -',
                                            args: {
                                                executable: '/bin/bash',
                                            },
                                            when: '".artifacts::apt_package::script" | eval != ""',
                                        },
                                        {
                                            name: 'add apt key',
                                            'ansible.builtin.apt_key': {
                                                url: '{{ ".artifacts::apt_package::key" | eval }}',
                                                keyring:
                                                    '/usr/share/keyrings/{{ ".artifacts::apt_package::repository" | eval }}.gpg',
                                                state: 'present',
                                            },
                                            when: '".artifacts::apt_package::key" | eval != ""',
                                        },
                                        {
                                            name: 'add apt repository',
                                            'ansible.builtin.apt_repository': {
                                                repo: 'deb [signed-by=/usr/share/keyrings/{{ ".artifacts::apt_package::repository" | eval }}.gpg] {{ ".artifacts::apt_package::source" | eval }}',
                                                filename: '{{ ".artifacts::apt_package::repository" | eval }}',
                                                state: 'present',
                                            },
                                            when: '".artifacts::apt_package::source" | eval != ""',
                                        },
                                        {
                                            name: 'update apt cache',
                                            'ansible.builtin.apt': {
                                                update_cache: 'yes',
                                            },
                                        },
                                        {
                                            name: 'install dependencies',
                                            'ansible.builtin.apt': {
                                                name: '{{ ".artifacts::apt_package::dependencies" | eval | split(",") | map("trim") }}',
                                                state: 'present',
                                            },
                                            when: '".artifacts::apt_package::dependencies" | eval != ""',
                                        },
                                        {
                                            name: 'install package',
                                            'ansible.builtin.apt': {
                                                name: '{{ ".artifacts::apt_package::file" | eval }}',
                                                state: 'present',
                                            },
                                            environment:
                                                '{{ ".artifacts::apt_package::env" | eval | split | map("split", "=") | community.general.dict }}',
                                        },
                                        {
                                            ...AnsibleCreateApplicationDirectoryTask(),
                                        },
                                        {
                                            ...AnsibleCopyOperationTask(MANAGEMENT_OPERATIONS.CREATE),
                                        },
                                        {
                                            ...AnsibleCallOperationTask(MANAGEMENT_OPERATIONS.CREATE),
                                        },
                                    ],
                                },
                                playbookArgs: [...AnsibleHostOperationPlaybookArgs()],
                            },
                        },
                        configure: {
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
                                            ...AnsibleCopyOperationTask(MANAGEMENT_OPERATIONS.CONFIGURE),
                                        },
                                        {
                                            ...AnsibleCallOperationTask(MANAGEMENT_OPERATIONS.CONFIGURE),
                                        },
                                    ],
                                },
                                playbookArgs: [...AnsibleHostOperationPlaybookArgs()],
                            },
                        },
                        start: {
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
                                            ...AnsibleCopyOperationTask(MANAGEMENT_OPERATIONS.START),
                                        },
                                        {
                                            ...AnsibleCallOperationTask(MANAGEMENT_OPERATIONS.START),
                                        },
                                    ],
                                },
                                playbookArgs: [...AnsibleHostOperationPlaybookArgs()],
                            },
                        },
                        stop: {
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
                                            ...AnsibleCopyOperationTask(MANAGEMENT_OPERATIONS.STOP),
                                        },
                                        {
                                            ...AnsibleCallOperationTask(MANAGEMENT_OPERATIONS.STOP),
                                        },
                                    ],
                                },
                                playbookArgs: [...AnsibleHostOperationPlaybookArgs()],
                            },
                        },
                        delete: {
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
                                            ...AnsibleCopyOperationTask(MANAGEMENT_OPERATIONS.DELETE),
                                        },
                                        {
                                            ...AnsibleCallOperationTask(MANAGEMENT_OPERATIONS.DELETE),
                                        },
                                        {
                                            ...AnsibleDeleteApplicationDirectoryTask(),
                                        },
                                        {
                                            name: 'uninstall package',
                                            'ansible.builtin.apt': {
                                                name: '{{ ".artifacts::apt_package::file" | eval }}',
                                                state: 'absent',
                                            },
                                        },
                                    ],
                                },
                                playbookArgs: [...AnsibleHostOperationPlaybookArgs()],
                            },
                        },
                    },
                },
            },
        }
    },
}

export default generator
