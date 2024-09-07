import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {TerraformStandardOperations} from '#technologies/plugins/rules/utils/terraform'
import {ApplicationProperties, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

// TODO: next: implement this

const generator: ImplementationGenerator = {
    component: 'redis.server',
    technology: 'terraform',
    artifact: 'cache.image',
    hosting: ['docker.engine', 'local.machine'],
    weight: 0.5,
    reason: 'Docker Compose is more specialized.',
    details: '"docker_container" and "docker_image" resources',

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
                ...TerraformStandardOperations(),
                defaults: {
                    inputs: {
                        main: {
                            terraform: [
                                {
                                    required_providers: [
                                        {
                                            docker: {
                                                source: 'kreuzwerker/docker',
                                                version: '3.0.2',
                                            },
                                        },
                                    ],
                                },
                            ],
                            provider: {
                                docker: [
                                    {
                                        host: 'unix:///var/run/docker.sock',
                                    },
                                ],
                            },
                            resource: {
                                docker_container: {
                                    application: [
                                        {
                                            env: ApplicationProperties(type, {quote: false}).toEnv(),
                                            image: '${docker_image.image.image_id}',
                                            name: '{{ SELF.application_name }}',
                                            network_mode: 'host',
                                        },
                                    ],
                                },
                                docker_image: {
                                    image: [
                                        {
                                            name: '{{ ".artifacts::docker_image::file" | eval }}',
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
