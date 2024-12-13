import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {TerraformStandardOperations} from '#technologies/plugins/rules/utils/terraform'
import {GCPProviderCredentials, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'redis.server',
    technology: 'terraform',
    artifact: 'cache.image',
    hosting: ['gcp.memorystore'],
    weight: 1,

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {
                ...GCPProviderCredentials(),
            },

            interfaces: {
                ...TerraformStandardOperations({
                    GOOGLE_APPLICATION_CREDENTIALS: {
                        eval: '.::gcp_service_account_file',
                    },
                }),
                defaults: {
                    inputs: {
                        main: {
                            terraform: [
                                {
                                    required_providers: [
                                        {
                                            google: {
                                                source: 'hashicorp/google',
                                                version: '5.39.1',
                                            },
                                        },
                                    ],
                                },
                            ],
                            provider: {
                                google: [
                                    {
                                        credentials: '{{ SELF.gcp_service_account_file }}',
                                        project: '{{ SELF.gcp_project }}',
                                        region: '{{ SELF.gcp_region }}',
                                    },
                                ],
                            },
                            resource: {
                                // https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/redis_instance
                                google_redis_instance: {
                                    cache: [
                                        {
                                            name: '{{ SELF.cache_name }}',
                                            memory_size_gb: 1,
                                            lifecycle: {
                                                prevent_destroy: true,
                                            },
                                        },
                                    ],
                                },
                            },
                            output: {
                                application_endpoint: [
                                    {
                                        value: '${google_redis_instance.cache.host}:${google_redis_instance.cache.port}',
                                    },
                                ],
                                application_address: [
                                    {
                                        value: '${google_redis_instance.cache.host}',
                                    },
                                ],
                                application_port: [
                                    {
                                        value: '${google_redis_instance.cache.port}',
                                    },
                                ],
                            },
                        },
                    },
                    outputs: {
                        application_endpoint: 'application_endpoint',
                        application_address: 'application_address',
                        application_port: 'application_port',
                    },
                },
            },
        }
    },
}

export default generator
