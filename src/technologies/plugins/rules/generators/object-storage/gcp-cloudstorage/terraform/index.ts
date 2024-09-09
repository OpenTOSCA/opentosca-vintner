import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {TerraformStandardOperations} from '#technologies/plugins/rules/utils/terraform'
import {GCPProviderCredentials, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'object.storage',
    technology: 'terraform',
    hosting: ['gcp.cloudstorage'],
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
            attributes: {
                // TODO: connectivity
                bucket_endpoint: {
                    type: 'string',
                    default: '{{ SELF.bucket_name }}',
                },
                // TODO: auth
                bucket_token: {
                    type: 'string',
                    default: '',
                },
                bucket_dialect: {
                    type: 'string',
                    default: 'gcp',
                },
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
                                // https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/storage_bucket
                                google_storage_bucket: {
                                    bucket: [
                                        {
                                            name: '{{ SELF.bucket_name }}',
                                            location: 'EU',
                                            force_destroy: true,
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
