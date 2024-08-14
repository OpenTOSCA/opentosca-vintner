import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {GCPProviderCredentials, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    id: 'mysql.dbms::ansible::gcp.cloudsql',
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
                Standard: {
                    operations: {
                        create: {
                            implementation: {
                                primary: 'Ansible',
                                operation_host: 'ORCHESTRATOR',
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
                                            name: 'create a instance',
                                            register: 'instance_info',
                                            'google.cloud.gcp_sql_instance': {
                                                name: '{{  SELF.dbms_name }}',
                                                database_version: 'MYSQL_5_7',
                                                settings: {
                                                    tier: 'db-f1-micro',
                                                    availability_type: 'REGIONAL',
                                                    backup_configuration: {
                                                        binary_log_enabled: true,
                                                        enabled: true,
                                                    },
                                                    ip_configuration: {
                                                        authorized_networks: [
                                                            {
                                                                value: '0.0.0.0/0',
                                                            },
                                                        ],
                                                    },
                                                },
                                                region: '{{ SELF.gcp_region }}',
                                                project: '{{ SELF.gcp_project }}',
                                            },
                                        },
                                        {
                                            name: 'set root password',
                                            'google.cloud.gcp_sql_user': {
                                                name: 'root',
                                                host: '%',
                                                password: '{{ SELF.dbms_password }}',
                                                instance: '{{ instance_info }}',
                                                project: '{{ SELF.gcp_project }}',
                                            },
                                        },
                                        {
                                            name: 'aet attributes',
                                            set_fact: {
                                                application_address:
                                                    '{{ instance_info.ipAddresses[0].ipAddress | trim }}',
                                            },
                                        },
                                    ],
                                },
                                resultTemplate:
                                    '- name: SELF\n  attributes:\n    application_address: "{{ outputs.application_address }}"\n',
                            },
                            outputs: {
                                application_address: null,
                            },
                        },
                        delete: {
                            implementation: {
                                primary: 'Ansible',
                                operation_host: 'ORCHESTRATOR',
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        {
                                            name: 'Activate service account',
                                            shell: 'gcloud auth activate-service-account --key-file {{ SELF.gcp_service_account_file }} --project {{ SELF.gcp_project }}',
                                        },
                                        {
                                            name: 'Delete Instance',
                                            shell: 'gcloud sql instances delete {{ SELF.dbms_name }} --quiet',
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
