import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleOrchestratorOperation,
    KubernetesCredentials,
    MetadataGenerated,
    MetadataUnfurl,
} from '#technologies/plugins/rules/utils'

// TODO: next: some syntax error at create-user

// TODO: does not use k8s auth

const generator: ImplementationGenerator = {
    component: 'mysql.database',
    technology: 'kubernetes',
    hosting: ['mysql.dbms', 'kubernetes.cluster'],
    weight: 0,
    comment: 'Kubernetes Job with imperative parts, while declarative other technologies provide declarative modules.',

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
                                            name: 'touch manifest',
                                            register: 'manifest',
                                            'ansible.builtin.tempfile': {
                                                suffix: '{{ SELF.database_name }}-{{ HOST.dbms_name }}.database.manifest.yaml',
                                            },
                                        },
                                        {
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
                                                                initContainers: [
                                                                    {
                                                                        name: 'create-database',
                                                                        image: 'mysql:{{ HOST.dbms_version }}',
                                                                        command: [
                                                                            'mysql',
                                                                            '--host={{ HOST.management_address }}',
                                                                            '--port={{ HOST.management_port }}',
                                                                            '--user=root',
                                                                            '--password={{ HOST.dbms_password }}',
                                                                            '-e',
                                                                            'CREATE DATABASE IF NOT EXISTS {{ SELF.database_name }}',
                                                                        ],
                                                                    },
                                                                    {
                                                                        name: 'create-user',
                                                                        image: 'mysql:{{ HOST.dbms_version }}',
                                                                        command: [
                                                                            'mysql',
                                                                            '--host={{ HOST.management_address }}',
                                                                            '--port={{ HOST.management_port }}',
                                                                            '--user=root',
                                                                            '--password={{ HOST.dbms_password }}',
                                                                            '-e',
                                                                            "CREATE USER IF NOT EXISTS '{{ SELF.database_user }}'@'%' IDENTIFIED BY '{{ SELF.database_password }}'",
                                                                        ],
                                                                    },
                                                                    {
                                                                        name: 'grant-privileges',
                                                                        image: 'mysql:{{ HOST.dbms_version }}',
                                                                        command: [
                                                                            'mysql',
                                                                            '--host={{ HOST.management_address }}',
                                                                            '--port={{ HOST.management_port }}',
                                                                            '--user=root',
                                                                            '--password={{ HOST.dbms_password }}',
                                                                            '-e',
                                                                            "GRANT ALL PRIVILEGES ON *.* TO '{{ SELF.database_user }}'@'%'",
                                                                        ],
                                                                    },
                                                                ],
                                                                containers: [
                                                                    {
                                                                        name: 'none',
                                                                        image: 'busybox',
                                                                        command: ['echo', "'done'"],
                                                                    },
                                                                ],
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                        {
                                            name: 'apply manifest',
                                            'ansible.builtin.shell': 'kubectl apply -f {{ manifest.path }}',
                                            args: {
                                                executable: '/usr/bin/bash',
                                            },
                                        },

                                        {
                                            name: 'wait for deployment',
                                            'ansible.builtin.shell':
                                                'kubectl wait --for=condition=complete --timeout=30s job/{{ SELF.database_name }}-{{ HOST.dbms_name }}',
                                            args: {
                                                executable: '/usr/bin/bash',
                                            },
                                        },

                                        {
                                            name: 'cleanup',
                                            'ansible.builtin.shell': 'kubectl delete -f {{ manifest.path }}',
                                            args: {
                                                executable: '/usr/bin/bash',
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                        delete: 'exit 0',
                    },
                },
            },
        }
    },
}

export default generator
