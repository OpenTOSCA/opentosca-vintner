import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleDockerHostEnvironment,
    AnsibleOrchestratorOperation,
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineHost,
} from '#technologies/plugins/rules/utils'

// TODO: we assume that dbms is exposed

const generator: ImplementationGenerator = {
    component: 'mysql.database',
    technology: 'compose',
    hosting: ['mysql.dbms', 'docker.engine', 'remote.machine'],
    weight: 0,
    reason: 'One-time use docker container ("fake Kubernetes job") with imperative parts, while other technologies provide declarative modules.',

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {
                ...OpenstackMachineHost(),
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
                                            name: 'touch compose',
                                            register: 'compose',
                                            'ansible.builtin.tempfile': {
                                                suffix: '{{ SELF.database_name }}-{{ HOST.dbms_name }}.database.compose.yaml',
                                            },
                                        },
                                        {
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
                                                            container_name:
                                                                '{{ SELF.database_name }}-{{ HOST.dbms_name }}-database-job',
                                                            image: 'mysql:{{ HOST.dbms_version }}',
                                                            network_mode: 'host',
                                                            command: [
                                                                'mysql',
                                                                '--host={{ HOST.management_address }}',
                                                                '--port={{ HOST.management_port }}',
                                                                '--user=root',
                                                                '--password={{ HOST.dbms_password }}',
                                                                '-e',
                                                                "CREATE DATABASE IF NOT EXISTS {{ SELF.database_name }}; CREATE USER IF NOT EXISTS '{{ SELF.database_user }}'@'%' IDENTIFIED BY '{{ SELF.database_password }}'; GRANT ALL PRIVILEGES ON *.* TO '{{ SELF.database_user }}'@'%';",
                                                            ],
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                        {
                                            name: 'apply compose',
                                            'ansible.builtin.shell': 'docker compose -f {{ compose.path }} up -d',
                                            args: {
                                                executable: '/usr/bin/bash',
                                            },
                                            environment: {
                                                ...AnsibleDockerHostEnvironment(),
                                            },
                                        },
                                        {
                                            name: 'give job some time',
                                            'ansible.builtin.pause': {
                                                seconds: 10,
                                            },
                                        },
                                        {
                                            name: 'unapply compose',
                                            'ansible.builtin.shell': 'docker compose -f {{ compose.path }} down',
                                            args: {
                                                executable: '/usr/bin/bash',
                                            },
                                            environment: {
                                                ...AnsibleDockerHostEnvironment(),
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                        // TODO: delete
                        delete: 'exit 0',
                    },
                },
            },
        }
    },
}

export default generator
