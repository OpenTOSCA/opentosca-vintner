import {
    AnsibleDockerEngineInstallationTasks,
    AnsibleDockerEngineUninstallationTasks,
} from '#technologies/plugins/rules/generators/docker-engine/machine/utils'
import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleHostOperation,
    AnsibleHostOperationPlaybookArgs,
    AnsibleWaitForSSHTask,
} from '#technologies/plugins/rules/utils/ansible'
import {MetadataGenerated, MetadataUnfurl, OpenstackMachineCredentials} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'docker.engine',
    technology: 'ansible',
    hosting: ['remote.machine'],
    weight: 1,
    reason: 'The Docker engine is hosted on a remote machine. Ansible is specialized for installing software components on remote targets, while Terraform discourages from being used to manage such scenarios.',

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {...OpenstackMachineCredentials()},
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
                                        ...AnsibleDockerEngineInstallationTasks(),
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
                                        ...AnsibleDockerEngineUninstallationTasks(),
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
