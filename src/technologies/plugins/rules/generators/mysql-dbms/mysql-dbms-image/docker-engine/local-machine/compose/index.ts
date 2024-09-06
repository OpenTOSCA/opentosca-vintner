import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleHostEndpointCapability,
    AnsibleOrchestratorOperation,
    MetadataGenerated,
    MetadataUnfurl,
} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    component: 'mysql.dbms',
    technology: 'compose',
    artifact: 'dbms.image',
    hosting: ['docker.engine', 'local.machine'],
    weight: 1,
    reason: 'Docker is the underlying technology.',
    details: 'docker-compose manifest generated and applied',

    generate: (name, type) => {
        const AnsibleTouchComposeTask = {
            name: 'touch compose',
            register: 'compose',
            'ansible.builtin.tempfile': {
                suffix: '{{ SELF.dbms_name }}.compose.yaml',
            },
        }

        const AnsibleCreateComposeTask = {
            name: 'create compose',
            'ansible.builtin.copy': {
                dest: '{{ compose.path }}',
                content: '{{ manifest | to_yaml }}',
            },
            vars: {
                manifest: {
                    name: '{{ SELF.dbms_name }}',
                    services: {
                        application: {
                            container_name: '{{ SELF.dbms_name }}',
                            image: 'mysql:{{ ".artifacts::dbms_image::file" | eval }}',
                            network_mode: 'host',
                            environment: {
                                MYSQL_ROOT_PASSWORD: '{{ SELF.dbms_password }}',
                            },
                        },
                    },
                },
            },
        }

        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            attributes: {
                application_address: {
                    type: 'string',
                    default: '127.0.0.1',
                },
                application_port: {
                    type: 'integer',
                    default: 3306,
                },
                management_address: {
                    type: 'string',
                    default: {
                        eval: '.::.requirements::[.name=host]::.target::management_address',
                    },
                },
                management_port: {
                    type: 'integer',
                    default: 3306,
                },
            },
            capabilities: {
                ...AnsibleHostEndpointCapability(),
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
                                        AnsibleTouchComposeTask,
                                        AnsibleCreateComposeTask,
                                        {
                                            name: 'apply compose',
                                            'ansible.builtin.shell': 'docker compose -f {{ compose.path }} up -d',
                                            args: {
                                                executable: '/usr/bin/bash',
                                            },
                                        },
                                        {
                                            name: 'let it cook',
                                            'ansible.builtin.pause': {
                                                seconds: 10,
                                            },
                                        },
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
                                        AnsibleTouchComposeTask,
                                        AnsibleCreateComposeTask,
                                        {
                                            name: 'unapply compose',
                                            'ansible.builtin.shell': 'docker compose -f {{ compose.path }} down',
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
