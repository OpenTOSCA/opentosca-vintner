import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {AnsibleOrchestratorOperation} from '#technologies/plugins/rules/utils/ansible'
import {GCPProviderCredentials, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'mysql.database',
    technology: 'ansible',
    hosting: ['mysql.dbms', 'gcp.cloudsql'],
    weight: 0,
    reason: 'Primary use case due to the specialization of Ansible. However, need to install and handle GCP CloudSQL Proxy, while the corresponding Terraform module already provides this.',

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
                                        // https://docs.ansible.com/ansible/latest/collections/google/cloud/gcp_sql_database_module.html
                                        {
                                            name: 'create a database',
                                            'google.cloud.gcp_sql_database': {
                                                name: '{{ SELF.database_name }}',
                                                charset: 'utf8',
                                                instance: '{{ HOST.dbms_name }}',
                                                project: '{{ SELF.gcp_project }}',
                                            },
                                        },
                                        // https://cloud.google.com/sql/docs/mysql/sql-proxy
                                        {
                                            name: 'install GCP CloudSQL Proxy',
                                            'ansible.builtin.get_url': {
                                                url: 'https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.13.0/cloud-sql-proxy.linux.amd64',
                                                dest: '/tmp/gcp-cloudsql-proxy',
                                                mode: '0755',
                                            },
                                        },
                                        // https://github.com/GoogleCloudPlatform/cloud-sql-proxy
                                        {
                                            name: 'forward port',
                                            'ansible.builtin.shell':
                                                '/tmp/gcp-cloudsql-proxy {{ SELF.gcp_project }}:{{ SELF.gcp_region }}:{{ HOST.dbms_name }} --credentials-file {{ SELF.gcp_service_account_file }} --port 23306 ',
                                            args: {
                                                executable: '/usr/bin/bash',
                                            },
                                            async: 30,
                                            poll: 0,
                                        },
                                        {
                                            name: 'wait for port',
                                            'ansible.builtin.wait_for': {
                                                host: '127.0.0.1',
                                                port: 23306,
                                                delay: 5,
                                                timeout: 30,
                                            },
                                        },
                                        // We do not use https://docs.ansible.com/ansible/latest/collections/google/cloud/gcp_sql_user_module.html since we can not manage privileges with it, see https://cloud.google.com/sql/docs/mysql/create-manage-users#creating
                                        {
                                            name: 'create user (with privileges)',
                                            'community.mysql.mysql_user': {
                                                name: '{{ SELF.database_user }}',
                                                password: '{{ SELF.database_password }}',
                                                host: '%',
                                                priv: '*.*:ALL',
                                                login_host: '127.0.0.1',
                                                login_password: '{{ HOST.dbms_password }}',
                                                login_port: 23306,
                                                login_user: 'root',
                                            },
                                        },
                                        {
                                            name: 'unforward port',
                                            'ansible.builtin.shell':
                                                'pkill -f "/tmp/gcp-cloudsql-proxy {{ SELF.gcp_project }}:{{ SELF.gcp_region }}:{{ HOST.dbms_name }}"',
                                            args: {
                                                executable: '/usr/bin/bash',
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
