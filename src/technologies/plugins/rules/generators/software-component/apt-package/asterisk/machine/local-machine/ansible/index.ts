import {NodeType} from '#spec/node-type'
import {
    AnsibleSoftwareApplicationAptPackageCreateTasks,
    AnsibleSoftwareApplicationAptPackageDeleteTask,
    AnsibleSoftwareApplicationConfigureTasks,
    AnsibleSoftwareApplicationDeleteTasks,
    AnsibleSoftwareApplicationStartTasks,
    AnsibleSoftwareApplicationStopTasks,
} from '#technologies/plugins/rules/generators/software-component/utils'
import {GeneratorAbstract} from '#technologies/plugins/rules/types'
import {AnsibleOrchestratorOperation} from '#technologies/plugins/rules/utils/ansible'
import {ApplicationDirectory, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

class Generator extends GeneratorAbstract {
    component = 'software.component'
    technology = 'ansible'
    artifact = 'apt.package'
    hosting = ['*', 'local.machine']
    weight = 1
    reason =
        'The software component is hosted on a local machine. Ansible is specialized for installing software components on local targets, while Terraform discourages from being used to manage such scenarios.'

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
                                    q: AnsibleSoftwareApplicationAptPackageCreateTasks(),
                                },
                            },
                        },
                        configure: {
                            implementation: {
                                ...AnsibleOrchestratorOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: AnsibleSoftwareApplicationConfigureTasks(),
                                },
                            },
                        },
                        start: {
                            implementation: {
                                ...AnsibleOrchestratorOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: AnsibleSoftwareApplicationStartTasks({assert: false}),
                                },
                            },
                        },
                        stop: {
                            implementation: {
                                ...AnsibleOrchestratorOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: AnsibleSoftwareApplicationStopTasks({assert: false}),
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
                                            ...AnsibleSoftwareApplicationAptPackageDeleteTask(),
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
