import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {TerraformStandardOperations} from '#technologies/plugins/rules/utils/terraform'
import {GCPProviderCredentials, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'mysql.database',
    technology: 'terraform',
    hosting: ['mysql.dbms', 'gcp.cloudsql'],
    weight: 1,
    reason: 'The MySQL database is hosted on a MySQL DBMS on GCP CloudSQL. Terraform provides an official provider for GCP. In contrast, the corresponding Ansible module is not maintained and violates community standards.',

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
                                // https://registry.terraform.io/providers/petoju/mysql/latest/docs#gcp-cloudsql-connection
                                mysql: [
                                    {
                                        endpoint:
                                            'cloudsql://{{ SELF.gcp_project }}:{{ SELF.gcp_region }}:{{ HOST.dbms_name }}',
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
