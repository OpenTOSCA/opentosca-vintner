import {MANAGEMENT_OPERATIONS} from '#spec/interface-definition'
import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleCallOperationTask,
    AnsibleCopyOperationTask,
    AnsibleHostOperation,
    AnsibleHostOperationPlaybookArgs,
    AnsibleWaitForSSHTask,
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    component: 'software.application',
    technology: 'ansible',
    artifact: 'software.package',
    hosting: ['*', 'virtual.machine'],

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {
                ...OpenstackMachineCredentials(),
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
                                                'curl -fsSL {{ ".artifacts::software_package::script" | eval }} | sudo -E bash -',
                                            when: '".artifacts::software_package::script" | eval != None',
                                        },
                                        {
                                            name: 'add apt key',
                                            'ansible.builtin.apt_key': {
                                                url: '{{ ".artifacts::software_package::key" | eval }}',
                                                keyring:
                                                    '/usr/share/keyrings/{{ ".artifacts::software_package::repository" | eval }}.gpg',
                                                state: 'present',
                                            },
                                            when: '".artifacts::software_package::key" | eval != None',
                                        },
                                        {
                                            name: 'add apt repository',
                                            'ansible.builtin.apt_repository': {
                                                repo: 'deb [signed-by=/usr/share/keyrings/{{ ".artifacts::software_package::repository" | eval }}.gpg] {{ ".artifacts::software_package::source" | eval }}',
                                                filename: '{{ ".artifacts::software_package::repository" | eval }}',
                                                state: 'present',
                                            },
                                            when: '".artifacts::software_package::source" | eval != None',
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
                                                name: '{{ ".artifacts::software_package::dependencies" | eval | split(",") | map("trim") }}',
                                                state: 'present',
                                            },
                                            when: '".artifacts::software_package::dependencies" | eval != None',
                                        },
                                        {
                                            name: 'install package',
                                            'ansible.builtin.apt': {
                                                name: '{{ ".artifacts::software_package::file" | eval }}',
                                                state: 'present',
                                            },
                                            environment:
                                                '{{ ".artifacts::software_package::file" | eval | split | map("split", "=") | community.general.dict }}',
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
                                            name: 'uninstall package',
                                            'ansible.builtin.apt': {
                                                name: '{{ ".artifacts::software_package::file | eval }}',
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