import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {TerraformStandardOperations} from '#technologies/plugins/rules/utils/terraform'
import {GCPProviderCredentials, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'object.storage',
    technology: 'terraform',
    hosting: ['gcp.cloudstorage'],
    weight: 1,
    reason: 'The object storage is hosted on GCP CloudStorage. Terraform provides an official provider for GCP. In contrast, the corresponding Ansible module is not maintained and violates community standards.',

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
                storage_endpoint: {
                    type: 'string',
                    default: '{{ SELF.storage_name }}',
                },
                storage_token: {
                    type: 'string',
                    default: '',
                },
                storage_dialect: {
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
                                            name: '{{ SELF.storage_name }}',
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
