import {NodeType} from '#spec/node-type'
import {
    AnsibleSoftwareApplicationSourceArchiveConfigure,
    AnsibleSoftwareApplicationSourceArchiveCreate,
    AnsibleSoftwareApplicationSourceArchiveDelete,
    AnsibleSoftwareApplicationSourceArchiveStart,
    AnsibleSoftwareApplicationSourceArchiveStop,
} from '#technologies/plugins/rules/generators/software-application/utils'
import {GeneratorAbstract} from '#technologies/plugins/rules/types'
import {AnsibleOrchestratorOperation, AnsibleWaitForSSHTask} from '#technologies/plugins/rules/utils/ansible'
import {ApplicationDirectory, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

class Generator extends GeneratorAbstract {
    component = 'software.application'
    technology = 'ansible'
    artifact = 'zip.archive'
    hosting = ['*', 'local.machine']
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
                            },
                        },
                        configure: {
                            implementation: {
                                ...AnsibleOrchestratorOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        {
                                            ...AnsibleWaitForSSHTask(),
                                        },
                                        ...AnsibleSoftwareApplicationSourceArchiveConfigure(),
                                    ],
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
                                        {
                                            ...AnsibleWaitForSSHTask(),
                                        },
                                        ...AnsibleSoftwareApplicationSourceArchiveStart(),
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
                                        {
                                            ...AnsibleWaitForSSHTask(),
                                        },
                                        ...AnsibleSoftwareApplicationSourceArchiveStop(),
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
                                        {
                                            ...AnsibleWaitForSSHTask(),
                                        },
                                        ...AnsibleSoftwareApplicationSourceArchiveDelete(),
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
