import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {AnsibleDockerContainerTask, AnsibleOrchestratorOperation} from '#technologies/plugins/rules/utils/ansible'
import {
    ApplicationProperties,
    LOCALHOST,
    MetadataGenerated,
    MetadataUnfurl,
} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'redis.server',
    technology: 'ansible',
    artifact: 'cache.image',
    hosting: ['docker.engine', 'local.machine'],
    weight: 0.5,

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
                                    q: [
                                        // https://hub.docker.com/_/redis
                                        {
                                            ...AnsibleDockerContainerTask({
                                                name: 'start container',
                                                container: {
                                                    name: '{{ SELF.cache_name }}',
                                                    image: 'redis:{{ ".artifacts::cache_image::file" | eval }}',
                                                    network_mode: 'host',
                                                    command: 'redis --port {{ SELF.application_port }}',
                                                    env: ApplicationProperties(type).toMap(),
                                                },
                                            }),
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
                                            ...AnsibleDockerContainerTask({
                                                name: 'stop container',
                                                container: {
                                                    name: '{{ SELF.cache_name }}',
                                                    state: 'absent',
                                                },
                                            }),
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
