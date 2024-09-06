import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleOrchestratorOperation,
    MetadataGenerated,
    MetadataUnfurl,
    mapProperties,
} from '#technologies/plugins/rules/utils'

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
                                            name: 'start container',
                                            'community.docker.docker_container': {
                                                name: '{{ SELF.application_name }}',
                                                image: '{{ ".artifacts::docker_image::file" | eval }}',
                                                network_mode: 'host',
                                                env: mapProperties(type, {format: 'map'}),
                                            },
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
                                            name: 'stop container',
                                            'community.docker.docker_container': {
                                                name: '{{ SELF.application_name }}',
                                                state: 'absent',
                                            },
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
