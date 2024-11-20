import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleApplyComposeTasks,
    AnsibleCreateComposeTask,
    AnsibleHostEndpointCapability,
    AnsibleOrchestratorOperation,
    AnsibleTouchComposeTask,
    AnsibleUnapplyComposeTasks,
} from '#technologies/plugins/rules/utils/ansible'
import {DockerCompose} from '#technologies/plugins/rules/utils/compose'
import {
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
    OpenstackMachineHost,
} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'mysql.dbms',
    technology: 'compose',
    artifact: 'dbms.image',
    hosting: ['docker.engine', 'remote.machine'],
    weight: 1,
    reason: 'Docker is the underlying technology.',

    generate: (name, type) => {
        const suffix = '{{ SELF.dbms_name }}'
        const remote = true

        const manifest: DockerCompose = {
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
        }

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
                                        AnsibleTouchComposeTask({suffix}),
                                        AnsibleCreateComposeTask({manifest}),
                                        ...AnsibleApplyComposeTasks({remote}),
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
                                        AnsibleTouchComposeTask({suffix}),
                                        AnsibleCreateComposeTask({manifest}),
                                        ...AnsibleUnapplyComposeTasks({remote}),
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
