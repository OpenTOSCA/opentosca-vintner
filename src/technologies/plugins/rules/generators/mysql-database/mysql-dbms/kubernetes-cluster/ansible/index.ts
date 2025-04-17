import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {AnsibleOrchestratorOperation} from '#technologies/plugins/rules/utils/ansible'
import {
    BASH_KUBECTL,
    KubernetesCredentials,
    MetadataGenerated,
    MetadataUnfurl,
} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'mysql.database',
    technology: 'ansible',
    hosting: ['mysql.dbms', 'kubernetes.cluster'],
    weight: 1,
    reason: 'The MySQL database is hosted on a MySQL DBMS on a Kubernetes cluster. Ansible and Terraform offer declarative modules for managing a MySQL database. However, in contrast to Terraform, Ansible provides better features to access the MySQL DBMS within the Kubernetes cluster.',

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {
                ...KubernetesCredentials(),
            },
            interfaces: {
                Standard: {
                    operations: {
                        create: {
                            implementation: {
                                ...AnsibleOrchestratorOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        {
                                            name: 'deploy database',
                                            block: [
                                                {
                                                    name: 'forward port',
                                                    'ansible.builtin.shell': `${BASH_KUBECTL} port-forward service/{{ HOST.dbms_name }} 23306:3306`,
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
                                                {
                                                    name: 'create database',
                                                    'community.mysql.mysql_db': {
                                                        name: '{{ SELF.database_name }}',
                                                        login_host: '127.0.0.1',
                                                        login_password: '{{ HOST.dbms_password }}',
                                                        login_port: '23306',
                                                        login_user: 'root',
                                                    },
                                                },
                                                {
                                                    name: 'create user (with privileges)',
                                                    'community.mysql.mysql_user': {
                                                        name: '{{ SELF.database_user }}',
                                                        password: '{{ SELF.database_password }}',
                                                        host: '%',
                                                        priv: '*.*:ALL',
                                                        login_host: '127.0.0.1',
                                                        login_password: '{{ HOST.dbms_password }}',
                                                        login_port: '23306',
                                                        login_user: 'root',
                                                    },
                                                },
                                            ],
                                            always: [
                                                {
                                                    name: 'unforward port',
                                                    'ansible.builtin.shell':
                                                        'pkill -f "port-forward service/{{ HOST.dbms_name }}"',
                                                    args: {
                                                        executable: '/usr/bin/bash',
                                                    },
                                                },
                                            ],
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
