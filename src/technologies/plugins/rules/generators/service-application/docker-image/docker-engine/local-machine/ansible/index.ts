import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {AnsibleDockerContainerTask, AnsibleOrchestratorOperation} from '#technologies/plugins/rules/utils/ansible'
import {ApplicationProperties, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'service.application',
    technology: 'ansible',
    artifact: 'docker.image',
    hosting: ['docker.engine', 'local.machine'],
    weight: 0.5,
    reason: 'Docker Compose is more specialized.',
    details: '"community.docker.docker_container" task',

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
                                                    name: '{{ SELF.application_name }}',
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
