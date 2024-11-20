import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleDockerContainerTask,
    AnsibleHostOperation,
    AnsibleHostOperationPlaybookArgs,
    AnsibleWaitForSSHTask,
} from '#technologies/plugins/rules/utils/ansible'
import {
    ApplicationProperties,
    LOCALHOST,
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'service.application',
    technology: 'ansible',
    artifact: 'docker.image',
    hosting: ['docker.engine', 'remote.machine'],
    weight: 0.5,
    reason: 'Docker Compose is more specialized.',

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {...OpenstackMachineCredentials()},
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
                                ...AnsibleHostOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        {
                                            ...AnsibleWaitForSSHTask(),
                                        },
                                        {
                                            ...AnsibleDockerContainerTask({
                                                name: 'start container',
                                                container: {
                                                    name: '{{ SELF.application_name }}',
                                                    image: '{{ ".artifacts::docker_image::file" | eval }}',
                                                    network_mode: 'host',
                                                    env: ApplicationProperties(type).toMap(),
                                                },
                                            }),
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
                                        {
                                            ...AnsibleDockerContainerTask({
                                                name: 'stop container',
                                                container: {
                                                    name: '{{ SELF.application_name }}',
                                                    state: 'absent',
                                                },
                                            }),
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
    },
}

export default generator
