import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleOrchestratorOperation,
    GCPProviderCredentials,
    MetadataGenerated,
    MetadataUnfurl,
} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    id: 'mysql.database::ansible::mysql.dbms::gcp.cloudsql',
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
                        create: {
                            implementation: {
                                ...AnsibleOrchestratorOperation(),
                                environment: {
                                    GCP_SERVICE_ACCOUNT_FILE: {
                                        eval: '.::gcp_service_account_file',
                                    },
                                    GCP_AUTH_KIND: 'serviceaccount',
                                },
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        {
                                            name: 'create a database',
                                            'google.cloud.gcp_sql_database': {
                                                name: '{{ SELF.database_name }}',
                                                charset: 'utf8',
                                                instance: '{{ HOST.dbms_name }}',
                                                project: '{{ SELF.gcp_project }}',
                                            },
                                        },
                                        {
                                            name: 'create user (with privileges)',
                                            'community.mysql.mysql_user': {
                                                name: '{{ SELF.database_user }}',
                                                password: '{{ SELF.database_password }}',
                                                host: '%',
                                                priv: '*.*:ALL',
                                                login_host: '{{ HOST.management_address }}',
                                                login_password: '{{ HOST.dbms_password }}',
                                                login_port: 3306,
                                                login_user: 'root',
                                            },
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
