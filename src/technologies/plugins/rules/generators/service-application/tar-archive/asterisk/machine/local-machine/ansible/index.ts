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
    AnsibleOrchestratorOperation,
    AnsibleStartApplicationSystemdUnit,
    AnsibleStopApplicationSystemdUnit,
    AnsibleSystemdDaemonReload,
} from '#technologies/plugins/rules/utils/ansible'
import {ApplicationDirectory, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

class Generator extends GeneratorAbstract {
    component = 'service.application'
    technology = 'ansible'
    artifact = 'tar.archive'
    hosting = ['*', 'local.machine']
    weight = 1
    reason = 'Primary use case due to the specialization of Ansible. Special integration for systemd.'
    details =
        '"ansible.builtin.file", "ansible.builtin.unarchive", "ansible.builtin.copy", "ansible.builtin.fail", "ansible.builtin.shell", and "ansible.builtin.systemd" tasks with "when" statements'

    generate(name: string, type: NodeType) {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {
                ...ApplicationDirectory(),
            },
            interfaces: {
                Standard: {
                    operations: {
                        create: {
                            implementation: {
                                ...AnsibleOrchestratorOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: [
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
                            },
                        },
                        configure: {
                            implementation: {
                                ...AnsibleOrchestratorOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: [...AnsibleSoftwareApplicationConfigureTasks()],
                                },
                            },
                        },
                        start: {
                            implementation: {
                                ...AnsibleOrchestratorOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        ...AnsibleSoftwareApplicationStartTasks({call: false}),
                                        {
                                            ...AnsibleStartApplicationSystemdUnit(),
                                        },
                                    ],
                                },
                            },
                        },
                        stop: {
                            implementation: {
                                ...AnsibleOrchestratorOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        ...AnsibleSoftwareApplicationStopTasks({assert: false}),
                                        {
                                            ...AnsibleStopApplicationSystemdUnit(),
                                        },
                                    ],
                                },
                            },
                        },
                        delete: {
                            implementation: {
                                ...AnsibleOrchestratorOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        ...AnsibleSoftwareApplicationDeleteTasks(),
                                        {
                                            ...AnsibleDeleteApplicationSystemdUnit(),
                                        },
                                        {
                                            ...AnsibleSystemdDaemonReload(),
                                        },
                                    ],
                                },
                            },
                        },
                    },
                },
            },
        }
    }
}

export default new Generator()
