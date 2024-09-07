import {MANAGEMENT_OPERATIONS} from '#spec/interface-definition'
import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleAssertOperationTask,
    AnsibleCallManagementOperationTask,
    AnsibleCopyManagementOperationTask,
    AnsibleCreateApplicationDirectoryTask,
    AnsibleCreateApplicationEnvironment,
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
    component: 'software.application',
    technology: 'ansible',
    artifact,
    hosting: ['*', 'remote.machine'],
    weight: 0.5,
    reason: 'While this is a primary use case due to the specialization of Ansible, we must rely on scripts. More specialized types should be used, e.g., service.application.',
    details:
        '"ansible.builtin.apt", "ansible.builtin.file", "ansible.builtin.unarchive", "ansible.builtin.copy", "ansible.builtin.fail", and "ansible.builtin.shell" tasks with "when" statements',

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
                                            ...AnsibleCallManagementOperationTask(MANAGEMENT_OPERATIONS.START),
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
                                            ...AnsibleAssertOperationTask(MANAGEMENT_OPERATIONS.STOP),
                                        },
                                        {
                                            ...AnsibleCopyManagementOperationTask(MANAGEMENT_OPERATIONS.STOP),
                                        },
                                        {
                                            ...AnsibleCallManagementOperationTask(MANAGEMENT_OPERATIONS.STOP),
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
