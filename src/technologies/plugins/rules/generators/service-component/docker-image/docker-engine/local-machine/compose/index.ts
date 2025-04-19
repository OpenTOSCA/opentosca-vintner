import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleApplyComposeTasks,
    AnsibleCreateComposeTask,
    AnsibleOrchestratorOperation,
    AnsibleTouchComposeTask,
    AnsibleUnapplyComposeTasks,
} from '#technologies/plugins/rules/utils/ansible'
import {DockerCompose} from '#technologies/plugins/rules/utils/compose'
import {ApplicationProperties, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'service.component',
    technology: 'compose',
    artifact: 'docker.image',
    hosting: ['docker.engine', 'local.machine'],
    weight: 1,
    reason: 'The service component is hosted on a Docker engine on a local machine. Docker Compose is natively integrated into the Docker engine.',

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
