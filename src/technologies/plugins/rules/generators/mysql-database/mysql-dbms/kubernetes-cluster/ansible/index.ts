import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleOrchestratorOperation,
    KubernetesCredentials,
    MetadataGenerated,
    MetadataUnfurl,
} from '#technologies/plugins/rules/utils'

// TODO: use k8s auth

const generator: ImplementationGenerator = {
    component: 'mysql.database',
    technology: 'ansible',
    hosting: ['mysql.dbms', 'kubernetes.cluster'],
    weight: 1,
    reason: 'Primary use case due to the specialization of Ansible.',

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
                                                    'ansible.builtin.shell':
                                                        'kubectl port-forward service/{{ HOST.dbms_name }} 23306:3306',
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
                                                        'pkill -f "kubectl port-forward service/{{ HOST.dbms_name }}"',
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
