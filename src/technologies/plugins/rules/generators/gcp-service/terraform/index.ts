import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    TerraformGoogleProviderConfiguration,
    TerraformGoogleProviderImport,
    TerraformRequiredVersion,
    TerraformStandardOperations,
} from '#technologies/plugins/rules/utils/terraform'
import {GCPProviderCredentials, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'gcp.service',
    technology: 'terraform',
    hosting: [],
    weight: 1,
    reason: 'The GCP service is hosted on GCP. Terraform provides an official provider for GCP. In contrast, the corresponding Ansible module is not maintained and violates community standards.',

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
                ...TerraformStandardOperations(),
                defaults: {
                    inputs: {
                        main: {
                            terraform: [
                                {
                                    required_providers: [
                                        {
                                            google: {...TerraformGoogleProviderImport()},
                                        },
                                    ],
                                    ...TerraformRequiredVersion(),
                                },
                            ],
                            provider: {
                                google: [
                                    {
                                        ...TerraformGoogleProviderConfiguration(),
                                    },
                                ],
                            },
                            resource: {
                                google_project_service: {
                                    gcp_service: [
                                        {
                                            disable_on_destroy: false,
                                            project: '{{ SELF.gcp_project }}',
                                            service: '{{ SELF.gcp_service }}',
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
