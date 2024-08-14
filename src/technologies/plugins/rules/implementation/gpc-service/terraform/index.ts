import {ImplementationGenerator} from '#technologies/plugins/rules/implementation/types'
import {GCPProviderCredentials, MetadataGenerated} from '#technologies/plugins/rules/implementation/utils'

const generator: ImplementationGenerator = {
    id: 'gcp.service::terraform',
    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {...MetadataGenerated()},
            properties: {...GCPProviderCredentials()},
            interfaces: {
                Standard: {
                    operations: {
                        configure: {
                            implementation: {
                                primary: 'Terraform',
                            },
                        },
                    },
                },
                defaults: {
                    inputs: {
                        main: {
                            terraform: [
                                {
                                    required_providers: [
                                        {
                                            google: {
                                                source: 'hashicorp/google',
                                                version: '4.67.0',
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
