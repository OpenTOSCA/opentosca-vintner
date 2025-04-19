import {
    AnsibleDockerEngineInstallationTasks,
    AnsibleDockerEngineUninstallationTasks,
} from '#technologies/plugins/rules/generators/docker-engine/machine/utils'
import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {AnsibleOrchestratorOperation} from '#technologies/plugins/rules/utils/ansible'
import {LOCALHOST, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

/**
 * Using https://github.com/geerlingguy/ansible-role-docker would further improve the Ansible playbook.
 * However, we already have the highest quality relatively to Terraform.
 */

const generator: ImplementationGenerator = {
    component: 'docker.engine',
    technology: 'ansible',
    hosting: ['local.machine'],
    weight: 1,
    reason: 'The Docker engine is hosted on a local machine. Ansible is specialized for installing software components on local targets, while Terraform discourages from being used to manage such scenarios.',

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
