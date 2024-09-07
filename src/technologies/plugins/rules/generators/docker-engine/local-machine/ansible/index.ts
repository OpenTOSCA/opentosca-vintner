import {
    AnsibleDockerEngineInstallationTasks,
    AnsibleDockerEngineUninstallationTasks,
} from '#technologies/plugins/rules/generators/docker-engine/utils'
import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {AnsibleOrchestratorOperation} from '#technologies/plugins/rules/utils/ansible'
import {LOCALHOST, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'docker.engine',
    technology: 'ansible',
    hosting: ['local.machine'],
    weight: 1,
    reason: 'Primary use case due to the specialization of Ansible.',
    details: '"ansible.builtin.shell", "ansible.builtin.group", and "ansible.builtin.user" tasks',

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            attributes: {
                application_address: {
                    type: 'string',
                    default: LOCALHOST,
                },
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
                                    q: [...AnsibleDockerEngineInstallationTasks()],
                                },
                            },
                        },
                        delete: {
                            implementation: {
                                ...AnsibleOrchestratorOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: [...AnsibleDockerEngineUninstallationTasks()],
                                },
                            },
                        },
                    },
                },
            },
        }
    },
}

export default generator
