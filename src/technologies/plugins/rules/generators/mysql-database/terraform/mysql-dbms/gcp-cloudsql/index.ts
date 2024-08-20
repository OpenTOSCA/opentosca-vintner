import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    GCPProviderCredentials,
    MetadataGenerated,
    MetadataUnfurl,
    TerraformStandardOperations,
} from '#technologies/plugins/rules/utils'

// TODO: we assume that dbms is exposed

const generator: ImplementationGenerator = {
    component: 'mysql.database',
    technology: 'terraform',
    hosting: ['mysql.dbms', 'gcp.cloudsql'],
    weight: 1,
    comment: 'Terraform provides a declarative module.',

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
                                // TODO: could also use GCP CloudSQL connection support, see https://registry.terraform.io/providers/petoju/mysql/latest/docs#gcp-cloudsql-connection
                                mysql: [
                                    {
                                        endpoint: '{{ HOST.management_address }}',
                                        password: '{{ HOST.dbms_password }}',
                                        username: 'root',
                                    },
                                ],
                            },
                            resource: {
                                google_sql_database: {
                                    database: [
                                        {
                                            name: '{{ SELF.database_name }}',
                                            instance: '{{ HOST.dbms_name }}',
                                        },
                                    ],
                                },
                                google_sql_user: {
                                    user: [
                                        {
                                            host: '%',
                                            instance: '{{ HOST.dbms_name }}',
                                            name: '{{ SELF.database_name }}',
                                            password: '{{ SELF.database_password }}',
                                        },
                                    ],
                                },
                                mysql_grant: {
                                    user: [
                                        {
                                            database: '{{ SELF.database_name }}',
                                            host: '%',
                                            table: '*',
                                            privileges: ['ALL'],
                                            user: '${google_sql_user.user.name}',
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
