import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {AnsibleOrchestratorOperation} from '#technologies/plugins/rules/utils/ansible'
import {
    BASH_KUBECTL,
    KubernetesCredentials,
    MetadataGenerated,
    MetadataUnfurl,
} from '#technologies/plugins/rules/utils/utils'

// TODO: next: migrate this

const generator: ImplementationGenerator = {
    component: 'object.storage',
    technology: 'kubernetes',
    hosting: ['minio.server', 'kubernetes.cluster'],
    weight: 0,
    reason: 'Kubernetes Job with imperative parts, while declarative other technologies provide declarative modules.',

    generate: (name, type) => {
        const AnsibleTouchJobTask = {
            name: 'touch manifest',
            register: 'manifest',
            'ansible.builtin.tempfile': {
                suffix: '{{ SELF.database_name }}-{{ HOST.dbms_name }}.database.manifest.yaml',
            },
        }

        const AnsibleCreateJobTask = (query: string) => {
            return {
                name: 'create manifest',
                'ansible.builtin.copy': {
                    dest: '{{ manifest.path }}',
                    content: '{{ job | to_yaml }}',
                },
                vars: {
                    job: {
                        apiVersion: 'batch/v1',
                        kind: 'Job',
                        metadata: {
                            name: '{{ SELF.database_name }}-{{ HOST.dbms_name }}',
                        },
                        spec: {
                            template: {
                                spec: {
                                    restartPolicy: 'Never',
                                    containers: [
                                        {
                                            name: '{{ SELF.database_name }}-{{ HOST.dbms_name }}',
                                            image: 'mysql:{{ HOST.dbms_version }}',
                                            command: [
                                                'mysql',
                                                '--host={{ HOST.management_address }}',
                                                '--port={{ HOST.management_port }}',
                                                '--user=root',
                                                '--password={{ HOST.dbms_password }}',
                                                '-e',
                                                query,
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                    },
                },
            }
        }

        const AnsibleApplyJobTasks = [
            {
                name: 'apply manifest',
                'ansible.builtin.shell': `${BASH_KUBECTL} apply -f {{ manifest.path }}`,
                args: {
                    executable: '/usr/bin/bash',
                },
            },
            {
                name: 'wait for deployment',
                'ansible.builtin.shell': `${BASH_KUBECTL} wait --for=condition=complete --timeout=30s job/{{ SELF.database_name }}-{{ HOST.dbms_name }}`,
                args: {
                    executable: '/usr/bin/bash',
                },
            },

            {
                name: 'cleanup',
                'ansible.builtin.shell': `${BASH_KUBECTL} delete -f {{ manifest.path }}`,
                args: {
                    executable: '/usr/bin/bash',
                },
            },
        ]

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
                                        AnsibleTouchJobTask,
                                        AnsibleCreateJobTask(
                                            "CREATE DATABASE IF NOT EXISTS {{ SELF.database_name }}; CREATE USER IF NOT EXISTS '{{ SELF.database_user }}'@'%' IDENTIFIED BY '{{ SELF.database_password }}'; GRANT ALL PRIVILEGES ON *.* TO '{{ SELF.database_user }}'@'%';"
                                        ),
                                        ...AnsibleApplyJobTasks,
                                    ],
                                },
                            },
                        },
                        delete: {
                            implementation: {
                                ...AnsibleOrchestratorOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        AnsibleTouchJobTask,
                                        AnsibleCreateJobTask(
                                            "DROP USER IF EXISTS '{{ SELF.database_user }}'@'%'; DROP DATABASE IF EXISTS {{ SELF.database_name }};"
                                        ),
                                        ...AnsibleApplyJobTasks,
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
