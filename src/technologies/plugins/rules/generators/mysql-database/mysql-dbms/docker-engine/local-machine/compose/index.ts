import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleApplyComposeTask,
    AnsibleCreateComposeTask,
    AnsibleOrchestratorOperation,
    AnsibleTouchComposeTask,
    AnsibleUnapplyComposeTask,
} from '#technologies/plugins/rules/utils/ansible'
import {MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

// TODO: we assume that dbms is exposed

const generator: ImplementationGenerator = {
    component: 'mysql.database',
    technology: 'compose',
    hosting: ['mysql.dbms', 'docker.engine', 'local.machine'],
    weight: 0,
    reason: 'One-time use docker container ("fake Kubernetes job") with imperative parts, while other technologies provide declarative modules.',

    generate: (name, type) => {
        const Operation = (query: string) => {
            return {
                implementation: {
                    ...AnsibleOrchestratorOperation(),
                },
                inputs: {
                    playbook: {
                        q: [
                            {
                                ...AnsibleTouchComposeTask({
                                    suffix: '{{ SELF.database_name }}-{{ HOST.dbms_name }}.database',
                                }),
                            },
                            {
                                ...AnsibleCreateComposeTask({
                                    manifest: {
                                        name: '{{ SELF.database_name }}-{{ HOST.dbms_name }}-database-job',
                                        services: {
                                            job: {
                                                container_name:
                                                    '{{ SELF.database_name }}-{{ HOST.dbms_name }}-database-job',
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
                                }),
                            },
                            {
                                ...AnsibleApplyComposeTask(),
                            },
                            {
                                name: 'give job some time',
                                'ansible.builtin.pause': {
                                    seconds: 10,
                                },
                            },
                            {
                                ...AnsibleUnapplyComposeTask(),
                            },
                        ],
                    },
                },
            }
        }

        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            interfaces: {
                Standard: {
                    operations: {
                        create: Operation(
                            "CREATE DATABASE IF NOT EXISTS {{ SELF.database_name }}; CREATE USER IF NOT EXISTS '{{ SELF.database_user }}'@'%' IDENTIFIED BY '{{ SELF.database_password }}'; GRANT ALL PRIVILEGES ON *.* TO '{{ SELF.database_user }}'@'%';"
                        ),
                        delete: Operation(
                            "DROP USER IF EXISTS '{{ SELF.database_user }}'@'%'; DROP DATABASE IF EXISTS {{ SELF.database_name }};"
                        ),
                    },
                },
            },
        }
    },
}

export default generator
