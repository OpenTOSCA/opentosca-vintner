import {NodeType} from '#spec/node-type'
import {
    AnsibleSoftwareApplicationConfigureTasks,
    AnsibleSoftwareApplicationDeleteTasks,
    AnsibleSoftwareApplicationSourceArchiveCreateTasks,
    AnsibleSoftwareApplicationStartTasks,
    AnsibleSoftwareApplicationStopTasks,
} from '#technologies/plugins/rules/generators/software-application/utils'
import {GeneratorAbstract} from '#technologies/plugins/rules/types'
import {
    AnsibleCreateApplicationSystemdUnit,
    AnsibleDeleteApplicationSystemdUnit,
    AnsibleEnableApplicationSystemdUnit,
    AnsibleHostOperation,
    AnsibleHostOperationPlaybookArgs,
    AnsibleStartApplicationSystemdUnit,
    AnsibleStopApplicationSystemdUnit,
    AnsibleSystemdDaemonReload,
    AnsibleWaitForSSHTask,
} from '#technologies/plugins/rules/utils/ansible'
import {
    ApplicationDirectory,
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
} from '#technologies/plugins/rules/utils/utils'

class Generator extends GeneratorAbstract {
    component = 'service.application'
    technology = 'ansible'
    artifact = 'tar.archive'
    hosting = ['*', 'remote.machine']
    weight = 1
    reason = 'Primary use case due to the specialization of Ansible. Special integration for systemd.'

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
                                        ...AnsibleSoftwareApplicationSourceArchiveCreateTasks({
                                            type,
                                            artifact: this.artifact,
                                        }),
                                        {
                                            ...AnsibleCreateApplicationSystemdUnit(),
                                        },
                                        {
                                            ...AnsibleEnableApplicationSystemdUnit(),
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
                                        {
                                            ...AnsibleStartApplicationSystemdUnit(),
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
                                        ...AnsibleSoftwareApplicationStopTasks(),
                                        {
                                            ...AnsibleStopApplicationSystemdUnit(),
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
                                        ...AnsibleSoftwareApplicationDeleteTasks(),
                                        {
                                            ...AnsibleDeleteApplicationSystemdUnit(),
                                        },
                                        {
                                            ...AnsibleSystemdDaemonReload(),
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
    }
}

export default new Generator()
