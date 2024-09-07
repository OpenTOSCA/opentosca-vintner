import {MANAGEMENT_OPERATIONS} from '#spec/interface-definition'
import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleAssertOperationTask,
    AnsibleCallManagementOperationTask,
    AnsibleCopyManagementOperationTask,
    AnsibleCreateApplicationDirectoryTask,
    AnsibleCreateApplicationEnvironment,
    AnsibleCreateApplicationSystemdUnit,
    AnsibleCreateVintnerDirectory,
    AnsibleDeleteApplicationDirectoryTask,
    AnsibleHostOperation,
    AnsibleHostOperationPlaybookArgs,
    AnsibleUnarchiveSourceArchiveFileTask,
    AnsibleWaitForSSHTask,
} from '#technologies/plugins/rules/utils/ansible'
import {
    ApplicationDirectory,
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
} from '#technologies/plugins/rules/utils/utils'

const artifact = 'zip.archive'

const generator: ImplementationGenerator = {
    component: 'service.application',
    technology: 'ansible',
    artifact,
    hosting: ['*', 'remote.machine'],
    weight: 1,
    reason: 'Primary use case due to the specialization of Ansible. Special integration for systemd.',
    details:
        '"ansible.builtin.file", "ansible.builtin.unarchive", "ansible.builtin.copy", "ansible.builtin.fail", "ansible.builtin.shell", and "ansible.builtin.systemd" tasks with "when" statements',

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
                                            name: 'install operational dependencies',
                                            'ansible.builtin.apt': {
                                                name: 'unzip',
                                                update_cache: 'yes',
                                            },
                                        },
                                        {
                                            ...AnsibleCreateApplicationDirectoryTask(),
                                        },
                                        {
                                            ...AnsibleUnarchiveSourceArchiveFileTask(artifact),
                                        },
                                        {
                                            ...AnsibleUnarchiveSourceArchiveFileTask(artifact),
                                        },
                                        {
                                            ...AnsibleCreateVintnerDirectory(),
                                        },
                                        {
                                            ...AnsibleCreateApplicationEnvironment(type),
                                        },
                                        {
                                            ...AnsibleCopyManagementOperationTask(MANAGEMENT_OPERATIONS.CREATE),
                                        },
                                        {
                                            ...AnsibleCallManagementOperationTask(MANAGEMENT_OPERATIONS.CREATE),
                                        },
                                        {
                                            ...AnsibleCreateApplicationSystemdUnit(),
                                        },
                                        {
                                            name: 'enable service',
                                            'ansible.builtin.systemd': {
                                                name: '{{ SELF.application_name }}',
                                                state: 'stopped',
                                                enabled: 'yes',
                                                daemon_reload: 'yes',
                                            },
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
                                            ...AnsibleCopyManagementOperationTask(MANAGEMENT_OPERATIONS.CONFIGURE),
                                        },
                                        {
                                            ...AnsibleCallManagementOperationTask(MANAGEMENT_OPERATIONS.CONFIGURE),
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
                                            ...AnsibleAssertOperationTask(MANAGEMENT_OPERATIONS.START),
                                        },
                                        {
                                            ...AnsibleCopyManagementOperationTask(MANAGEMENT_OPERATIONS.START),
                                        },
                                        {
                                            name: 'start service',
                                            'ansible.builtin.systemd': {
                                                name: '{{ SELF.application_name }}',
                                                state: 'started',
                                                enabled: 'yes',
                                                daemon_reload: 'yes',
                                            },
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
                                            ...AnsibleCopyManagementOperationTask(MANAGEMENT_OPERATIONS.STOP),
                                        },
                                        {
                                            ...AnsibleCallManagementOperationTask(MANAGEMENT_OPERATIONS.STOP),
                                        },
                                        {
                                            name: 'stop service',
                                            'ansible.builtin.systemd': {
                                                name: '{{ SELF.application_name }}',
                                                state: 'stopped',
                                            },
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
                                            ...AnsibleCopyManagementOperationTask(MANAGEMENT_OPERATIONS.DELETE),
                                        },
                                        {
                                            ...AnsibleCallManagementOperationTask(MANAGEMENT_OPERATIONS.DELETE),
                                        },
                                        {
                                            name: 'delete systemd service',
                                            'ansible.builtin.file': {
                                                path: '/etc/systemd/system/{{ SELF.application_name }}.service',
                                                state: 'absent',
                                            },
                                        },
                                        {
                                            name: 'reload daemon',
                                            'ansible.builtin.systemd': {
                                                daemon_reload: true,
                                            },
                                        },
                                        {
                                            ...AnsibleDeleteApplicationDirectoryTask(),
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
