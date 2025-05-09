import {MANAGEMENT_OPERATIONS} from '#spec/interface-definition'
import {NodeType} from '#spec/node-type'
import {
    AnsibleSoftwareApplicationConfigureTasks,
    AnsibleSoftwareApplicationDeleteTasks,
    AnsibleSoftwareApplicationSourceArchiveCreateTasks,
    AnsibleSoftwareApplicationStartTasks,
    AnsibleSoftwareApplicationStopTasks,
} from '#technologies/plugins/rules/generators/software-component/utils'
import {GeneratorAbstract} from '#technologies/plugins/rules/types'
import {AnsibleOrchestratorOperation} from '#technologies/plugins/rules/utils/ansible'
import {ApplicationDirectory, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

class Generator extends GeneratorAbstract {
    component = 'software.component'
    technology = 'ansible'
    operations = [MANAGEMENT_OPERATIONS.CREATE, MANAGEMENT_OPERATIONS.DELETE]
    artifact = 'zip.archive'
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
