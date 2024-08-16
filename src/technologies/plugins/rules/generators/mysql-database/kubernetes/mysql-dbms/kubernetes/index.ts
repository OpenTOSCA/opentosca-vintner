import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleOrchestratorOperation,
    KubernetesCredentials,
    MetadataGenerated,
    MetadataUnfurl,
} from '#technologies/plugins/rules/utils'

// TODO: some syntax error at create-user

const generator: ImplementationGenerator = {
    id: 'mysql.database::kubernetes::mysql.dbms::kubernetes',
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
                                                                        image: '{{ HOST.dbms_image }}',
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
                                                                        image: '{{ HOST.dbms_image }}',
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
                                                                        image: '{{ HOST.dbms_image }}',
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
