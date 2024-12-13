import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    TerraformDockerProviderImport,
    TerraformDockerProviderLocalConfiguration,
    TerraformRequiredVersion,
    TerraformStandardOperations,
} from '#technologies/plugins/rules/utils/terraform'
import {ApplicationProperties, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'service.application',
    technology: 'terraform',
    artifact: 'docker.image',
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
                                                ...TerraformDockerProviderImport(),
                                            },
                                        },
                                    ],
                                    ...TerraformRequiredVersion(),
                                },
                            ],
                            provider: {
                                docker: [
                                    {
                                        ...TerraformDockerProviderLocalConfiguration(),
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
