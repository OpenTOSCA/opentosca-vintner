import {NodeType} from '#spec/node-type'
import {
    AnsibleSoftwareApplicationConfigureTasks,
    AnsibleSoftwareApplicationDeleteTasks,
    AnsibleSoftwareApplicationSourceArchiveCreateTasks,
    AnsibleSoftwareApplicationStartTasks,
    AnsibleSoftwareApplicationStopTasks,
} from '#technologies/plugins/rules/generators/software-application/utils'
import {GeneratorAbstract} from '#technologies/plugins/rules/types'
import {AnsibleOrchestratorOperation} from '#technologies/plugins/rules/utils/ansible'
import {ApplicationDirectory, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

class Generator extends GeneratorAbstract {
    component = 'software.application'
    technology = 'ansible'
    artifact = 'zip.archive'
    hosting = ['*', 'local.machine']
    weight = 0.5
    reason =
        'While this is a primary use case due to the specialization of Ansible, we must rely on scripts. More specialized types should be used, e.g., service.application.'

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
                                        {
                                            name: 'install operational dependencies',
                                            'ansible.builtin.apt': {
                                                name: 'unzip',
                                                update_cache: 'yes',
                                            },
                                        },
                                        ...AnsibleSoftwareApplicationSourceArchiveCreateTasks({
                                            type,
                                            artifact: this.artifact,
                                        }),
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
                                    q: [...AnsibleSoftwareApplicationStartTasks()],
                                },
                            },
                        },
                        stop: {
                            implementation: {
                                ...AnsibleOrchestratorOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: [...AnsibleSoftwareApplicationStopTasks()],
                                },
                            },
                        },
                        delete: {
                            implementation: {
                                ...AnsibleOrchestratorOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: [...AnsibleSoftwareApplicationDeleteTasks()],
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
