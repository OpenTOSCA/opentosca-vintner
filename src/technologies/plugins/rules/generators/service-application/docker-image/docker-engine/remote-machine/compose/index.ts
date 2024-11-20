import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleApplyComposeTasks,
    AnsibleCreateComposeTask,
    AnsibleOrchestratorOperation,
    AnsibleTouchComposeTask,
    AnsibleUnapplyComposeTasks,
} from '#technologies/plugins/rules/utils/ansible'
import {DockerCompose} from '#technologies/plugins/rules/utils/compose'
import {
    ApplicationProperties,
    LOCALHOST,
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
    OpenstackMachineHost,
} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'service.application',
    technology: 'compose',
    artifact: 'docker.image',
    hosting: ['docker.engine', 'remote.machine'],
    weight: 1,
    reason: 'Docker is the underlying technology.',

    generate: (name, type) => {
        const suffix = '{{ SELF.application_name }}'
        const remote = true

        const manifest: DockerCompose = {
            name: '{{ SELF.application_name }}',
            services: {
                application: {
                    container_name: '{{ SELF.application_name }}',
                    image: '{{ ".artifacts::docker_image::file" | eval }}',
                    network_mode: 'host',
                    environment: ApplicationProperties(type).toMap(),
                },
            },
        }

        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {
                ...OpenstackMachineHost(),
                ...OpenstackMachineCredentials(),
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
                                    q: [
                                        {
                                            ...AnsibleTouchComposeTask({suffix}),
                                        },
                                        {
                                            ...AnsibleCreateComposeTask({manifest}),
                                        },
                                        ...AnsibleApplyComposeTasks({remote}),
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
                                            ...AnsibleTouchComposeTask({suffix}),
                                        },
                                        {
                                            ...AnsibleCreateComposeTask({manifest}),
                                        },
                                        ...AnsibleUnapplyComposeTasks({remote}),
                                    ],
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
