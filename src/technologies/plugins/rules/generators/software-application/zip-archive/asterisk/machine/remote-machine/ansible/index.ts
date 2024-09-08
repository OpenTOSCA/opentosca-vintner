import {NodeType} from '#spec/node-type'
import {
    AnsibleSoftwareApplicationConfigureTasks,
    AnsibleSoftwareApplicationDeleteTasks,
    AnsibleSoftwareApplicationSourceArchiveCreate,
    AnsibleSoftwareApplicationStartTasks,
    AnsibleSoftwareApplicationStopTasks,
} from '#technologies/plugins/rules/generators/software-application/utils'
import {GeneratorAbstract} from '#technologies/plugins/rules/types'
import {
    AnsibleHostOperation,
    AnsibleHostOperationPlaybookArgs,
    AnsibleWaitForSSHTask,
} from '#technologies/plugins/rules/utils/ansible'
import {
    ApplicationDirectory,
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
} from '#technologies/plugins/rules/utils/utils'

class Generator extends GeneratorAbstract {
    component = 'software.application'
    technology = 'ansible'
    artifact = 'zip.archive'
    hosting = ['*', 'remote.machine']
    weight = 0.5
    reason =
        'While this is a primary use case due to the specialization of Ansible, we must rely on scripts. More specialized types should be used, e.g., service.application.'
    details =
        '"ansible.builtin.apt", "ansible.builtin.file", "ansible.builtin.unarchive", "ansible.builtin.copy", "ansible.builtin.fail", and "ansible.builtin.shell" tasks with "when" statements'

    generate(name: string, type: NodeType) {
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
                                        ...AnsibleSoftwareApplicationSourceArchiveCreate({
                                            type,
                                            artifact: this.artifact,
                                        }),
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
                                        ...AnsibleSoftwareApplicationConfigureTasks(),
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
                                        ...AnsibleSoftwareApplicationStartTasks(),
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
                                        ...AnsibleSoftwareApplicationStopTasks(),
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
                                        ...AnsibleSoftwareApplicationDeleteTasks(),
                                    ],
                                },
                                playbookArgs: [...AnsibleHostOperationPlaybookArgs()],
                            },
                        },
                    },
                },
            },
        }
    }
}

export default new Generator()
