import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleApplyComposeTask,
    AnsibleCreateComposeTask,
    AnsibleOrchestratorOperation,
    AnsibleTouchComposeTask,
    AnsibleUnapplyComposeTask,
} from '#technologies/plugins/rules/utils/ansible'
import {DockerCompose} from '#technologies/plugins/rules/utils/compose'
import {ApplicationProperties, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

// TODO: next: implement this

const generator: ImplementationGenerator = {
    component: 'redis.server',
    technology: 'compose',
    artifact: 'cache.image',
    hosting: ['docker.engine', 'local.machine'],
    weight: 1,
    reason: 'Docker is the underlying technology.',
    details: 'docker compose manifest generated and applied',

    generate: (name, type) => {
        const suffix = '{{ SELF.application_name }}'

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
            attributes: {
                application_address: {
                    type: 'string',
                    default: '127.0.0.1',
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
                                        {
                                            ...AnsibleApplyComposeTask(),
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
                                        {
                                            ...AnsibleTouchComposeTask({suffix}),
                                        },
                                        {
                                            ...AnsibleCreateComposeTask({manifest}),
                                        },
                                        {
                                            ...AnsibleUnapplyComposeTask(),
                                        },
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
