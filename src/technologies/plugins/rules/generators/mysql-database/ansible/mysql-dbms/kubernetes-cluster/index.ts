import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleOrchestratorOperation,
    KubernetesCredentials,
    MetadataGenerated,
    MetadataUnfurl,
} from '#technologies/plugins/rules/utils'

// TODO: use https://docs.ansible.com/ansible/latest/collections/kubernetes/core/k8s_exec_module.html#ansible-collections-kubernetes-core-k8s-exec-module ?

// TODO: use  https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/ ?

// https://stackoverflow.com/questions/37288500/how-to-undo-a-kubectl-port-forward

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
                                            name: 'create database',
                                            'ansible.builtin.shell':
                                                'kubectl exec deploy/{{ HOST.dbms_name }} -- mysql --password={{ HOST.dbms_password }} -e "CREATE DATABASE IF NOT EXISTS {{ SELF.database_name }}"',
                                            args: {
                                                executable: '/usr/bin/bash',
                                            },
                                        },
                                        {
                                            name: 'create user',
                                            'ansible.builtin.shell':
                                                "kubectl exec deploy/{{ HOST.dbms_name }}  -- mysql --password={{ HOST.dbms_password }} -e \"CREATE USER IF NOT EXISTS '{{ SELF.database_user }}'@'%' IDENTIFIED BY '{{ SELF.database_password }}'\"",
                                            args: {
                                                executable: '/usr/bin/bash',
                                            },
                                        },
                                        {
                                            name: 'grant privileges',
                                            'ansible.builtin.shell':
                                                "kubectl exec deploy/{{ HOST.dbms_name }}  -- mysql --password={{ HOST.dbms_password }} -e \"GRANT ALL PRIVILEGES ON *.* TO '{{ SELF.database_user }}'@'%'\"",
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
