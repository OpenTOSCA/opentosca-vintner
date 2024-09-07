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
    reason: 'Terraform provides a declarative module.',
    details: '"google_project_service" resource',

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
                                    cloud_sql_admin: [
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
