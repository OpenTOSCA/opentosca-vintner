import * as files from '#files'
import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleOrchestratorOperation,
    KubernetesCredentials,
    MetadataGenerated,
    MetadataUnfurl,
} from '#technologies/plugins/rules/utils'

// TODO: use https://docs.ansible.com/ansible/latest/collections/kubernetes/core/k8s_exec_module.html#ansible-collections-kubernetes-core-k8s-exec-module ?

// TODO: use  https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/ ?

// TODO: use https://stackoverflow.com/questions/37288500/how-to-undo-a-kubectl-port-forward

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
                                            name: 'create service',
                                            'ansible.builtin.copy': {
                                                dest: '/etc/systemd/system/kubectl-port-forward.service',
                                                content: files.toINI({
                                                    Unit: {
                                                        After: 'network.target',
                                                    },
                                                    Service: {
                                                        Type: 'simple',
                                                        ExecStart: `kubectl port-forward service/{{ HOST.dbms_name }} 23306:3306"`,
                                                    },
                                                    Install: {
                                                        WantedBy: 'multi-user.target',
                                                    },
                                                }),
                                            },
                                        },
                                        {
                                            name: 'enable service',
                                            'ansible.builtin.systemd': {
                                                name: 'kubectl-port-forward',
                                                state: 'started',
                                                daemon_reload: 'yes',
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
                                        {
                                            name: 'stop service',
                                            'ansible.builtin.systemd': {
                                                name: 'kubectl-port-forward',
                                                state: 'stopped',
                                            },
                                        },
                                        {
                                            name: 'delete systemd service',
                                            'ansible.builtin.file': {
                                                path: '/etc/systemd/system/kubectl-port-forward.service',
                                                state: 'absent',
                                            },
                                        },
                                        {
                                            name: 'reload daemon',
                                            'ansible.builtin.systemd': {
                                                daemon_reload: true,
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
