import {MANAGEMENT_OPERATIONS} from '#spec/interface-definition'
import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleAssertOperationTask,
    AnsibleCallOperationTask,
    AnsibleCopyOperationTask,
    AnsibleCreateApplicationDirectoryTask,
    AnsibleCreateApplicationEnvironment,
    AnsibleCreateVintnerDirectory,
    AnsibleDeleteApplicationDirectoryTask,
    AnsibleHostOperation,
    AnsibleHostOperationPlaybookArgs,
    AnsibleUnarchiveZipArchiveFileTask,
    AnsibleUnarchiveZipArchiveUrlTask,
    AnsibleWaitForSSHTask,
    ApplicationDirectory,
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    component: 'software.application',
    technology: 'ansible',
    artifact: 'zip.archive',
    hosting: ['*', 'virtual.machine'],
    weight: 0.5,
    reasoning:
        'While this is a primary use case due to the specialization of Ansible, we must rely on scripts. More specialized types should be used, e.g., service.application.',

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
                                            ...AnsibleUnarchiveZipArchiveFileTask(),
                                        },
                                        {
                                            ...AnsibleUnarchiveZipArchiveUrlTask(),
                                        },
                                        {
                                            ...AnsibleCreateVintnerDirectory(),
                                        },
                                        {
                                            ...AnsibleCreateApplicationEnvironment(type),
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
                                            ...AnsibleAssertOperationTask(MANAGEMENT_OPERATIONS.START),
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
                                            ...AnsibleAssertOperationTask(MANAGEMENT_OPERATIONS.STOP),
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
