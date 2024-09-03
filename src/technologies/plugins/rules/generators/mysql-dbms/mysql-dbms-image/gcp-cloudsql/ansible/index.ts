import * as files from '#files'
import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleOrchestratorOperation,
    GCPProviderCredentials,
    MetadataGenerated,
    MetadataUnfurl,
} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    component: 'mysql.dbms',
    technology: 'ansible',
    artifact: 'mysql.dbms.image',
    hosting: ['gcp.cloudsql'],
    weight: 1,
    reason: 'Primary use case due to the specialization of Ansible.',
    details: '"google.cloud.gcp_sql_instance" and "google.cloud.gcp_sql_user" tasks',

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
                                        // https://docs.ansible.com/ansible/latest/collections/google/cloud/gcp_sql_instance_module.html
                                        {
                                            name: 'create a instance',
                                            register: 'instance_info',
                                            'google.cloud.gcp_sql_instance': {
                                                name: '{{  SELF.dbms_name }}',
                                                database_version:
                                                    'MYSQL_{{ ".artifacts::mysql_dbms_image::file" | eval | replace(".", "_") }}',
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
                                        // https://docs.ansible.com/ansible/latest/collections/google/cloud/gcp_sql_user_module.html
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
                                resultTemplate: files.toYAML({
                                    name: 'SELF',
                                    attributes: {
                                        application_address: '{{ outputs.application_address }}',
                                    },
                                }),
                            },
                            outputs: {
                                application_address: null,
                            },
                        },
                        delete: {
                            implementation: {
                                ...AnsibleOrchestratorOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        {
                                            name: 'Activate service account',
                                            'ansible.builtin.shell':
                                                'gcloud auth activate-service-account --key-file {{ SELF.gcp_service_account_file }} --project {{ SELF.gcp_project }}',
                                            args: {
                                                executable: '/bin/bash',
                                            },
                                        },
                                        {
                                            name: 'Delete Instance',
                                            'ansible.builtin.shell':
                                                'gcloud sql instances delete {{ SELF.dbms_name }} --quiet',
                                            args: {
                                                executable: '/bin/bash',
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
