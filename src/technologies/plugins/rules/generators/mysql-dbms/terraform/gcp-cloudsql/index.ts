import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    GCPProviderCredentials,
    MetadataGenerated,
    MetadataUnfurl,
    TerraformStandardOperations,
} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    component: 'mysql.dbms',
    technology: 'terraform',
    hosting: ['gcp.cloudsql'],
    weight: 1,
    reason: 'Terraform provides a declarative module.',
    details: '"google_sql_database_instance" and "google_sql_user" resources',

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {
                ...GCPProviderCredentials(),
                dbms_ssl_mode: {
                    type: 'string',
                    default: 'Preferred',
                },
            },
            attributes: {
                application_port: {
                    type: 'string',
                    default: 3306,
                },
                management_address: {
                    type: 'string',
                    default: {
                        eval: '.::application_address',
                    },
                },
                management_port: {
                    type: 'integer',
                    default: {
                        eval: '.::application_port',
                    },
                },
            },
            interfaces: {
                ...TerraformStandardOperations(),
                defaults: {
                    outputs: {
                        application_address: 'application_address',
                    },
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
                            output: {
                                application_address: [
                                    {
                                        value: '${google_sql_database_instance.dbms.public_ip_address}',
                                    },
                                ],
                            },
                            resource: {
                                google_sql_database_instance: {
                                    dbms: [
                                        {
                                            database_version: 'MYSQL_{{ SELF.dbms_version | replace(".", "_") }}',
                                            deletion_protection: false,
                                            name: '{{ SELF.dbms_name }}',
                                            root_password: '{{ SELF.dbms_password }}',
                                            settings: [
                                                {
                                                    availability_type: 'REGIONAL',
                                                    backup_configuration: [
                                                        {
                                                            binary_log_enabled: true,
                                                            enabled: true,
                                                        },
                                                    ],
                                                    ip_configuration: [
                                                        {
                                                            authorized_networks: [
                                                                {
                                                                    name: 'public',
                                                                    value: '0.0.0.0/0',
                                                                },
                                                            ],
                                                            ipv4_enabled: true,
                                                        },
                                                    ],
                                                    tier: 'db-f1-micro',
                                                },
                                            ],
                                        },
                                    ],
                                },
                                google_sql_user: {
                                    user: [
                                        {
                                            host: '%',
                                            instance: '${google_sql_database_instance.dbms.name}',
                                            name: 'root',
                                            password: '${google_sql_database_instance.dbms.root_password}',
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
