import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {GCPProviderCredentials, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    id: 'mysql.database::terraform::mysql.dbms.dbms::gcp.cloudsql',
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
                Standard: {
                    operations: {
                        configure: {
                            implementation: {
                                primary: 'Terraform',
                            },
                        },
                        delete: {
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
