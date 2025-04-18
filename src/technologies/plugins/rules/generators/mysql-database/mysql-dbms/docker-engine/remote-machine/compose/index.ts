import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleApplyComposeTasks,
    AnsibleOrchestratorOperation,
    AnsibleUnapplyComposeTasks,
} from '#technologies/plugins/rules/utils/ansible'
import {
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
    OpenstackMachineHost,
} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'mysql.database',
    technology: 'compose',
    hosting: ['mysql.dbms', 'docker.engine', 'remote.machine'],
    weight: 0,
    reason: 'One-time use docker container ("fake Kubernetes job") with imperative parts, while other technologies provide declarative modules.',

    generate: (name, type) => {
        const remote = true

        const AnsibleTouchJobTask = {
            name: 'touch compose',
            register: 'compose',
            'ansible.builtin.tempfile': {
                suffix: '{{ SELF.database_name }}-{{ HOST.dbms_name }}.database.compose.yaml',
            },
        }

        const AnsibleCreateJobTask = (query: string) => {
            return {
                name: 'create compose',
                'ansible.builtin.copy': {
                    dest: '{{ compose.path }}',
                    content: '{{ manifest | to_yaml }}',
                },
                vars: {
                    manifest: {
                        name: '{{ SELF.database_name }}-{{ HOST.dbms_name }}-database-job',
                        services: {
                            job: {
                                container_name: '{{ SELF.database_name }}-{{ HOST.dbms_name }}-database-job',
                                image: 'mysql:{{ ".artifacts::dbms_image::file" | eval }}',
                                network_mode: 'host',
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
                        },
                    },
                },
            }
        }

        const AnsibleApplyJobTasks = [
            ...AnsibleApplyComposeTasks({remote}),
            {
                name: 'let it cook',
                'ansible.builtin.pause': {
                    seconds: 10,
                },
            },
            ...AnsibleUnapplyComposeTasks({remote}),
        ]

        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {
                ...OpenstackMachineHost(),
                ...OpenstackMachineCredentials(),
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
