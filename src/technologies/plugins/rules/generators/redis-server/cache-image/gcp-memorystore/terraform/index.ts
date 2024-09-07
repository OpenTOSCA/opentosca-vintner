import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {TerraformStandardOperations} from '#technologies/plugins/rules/utils/terraform'
import {GCPProviderCredentials, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

// TODO: next: implement this, see https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/redis_instance

const generator: ImplementationGenerator = {
    component: 'redis.server',
    technology: 'terraform',
    artifact: 'cache.image',
    hosting: ['gcp.memorystore'],
    weight: 1,
    reason: 'Terraform provides a declarative module.',

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
                                            mysql: {
                                                source: 'petoju/mysql',
                                                version: '3.0.48',
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
                            resource: {},
                        },
                    },
                },
            },
        }
    },
}

export default generator
