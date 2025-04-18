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
} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'redis.server',
    technology: 'compose',
    artifact: 'cache.image',
    hosting: ['docker.engine', 'local.machine'],
    weight: 1,
    reason: 'The redis server is hosted on a Docker engine on a local machine. Docker Compose is natively integrated into the Docker engine.',

    generate: (name, type) => {
        const suffix = '{{ SELF.cache_name }}'

        const manifest: DockerCompose = {
            name: '{{ SELF.cache_name }}',
            services: {
                application: {
                    container_name: '{{ SELF.cache_name }}',
                    image: 'redis:{{ ".artifacts::cache_image::file" | eval }}',
                    network_mode: 'host',
                    command: ['redis', '--port', '{{ SELF.application_port }}'],
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
                                        ...AnsibleApplyComposeTasks(),
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
                                        ...AnsibleUnapplyComposeTasks(),
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
