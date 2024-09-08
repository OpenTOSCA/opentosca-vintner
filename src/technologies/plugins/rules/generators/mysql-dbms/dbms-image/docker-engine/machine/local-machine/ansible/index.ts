import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {AnsibleDockerContainerTask, AnsibleOrchestratorOperation} from '#technologies/plugins/rules/utils/ansible'
import {LOCALHOST, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'mysql.dbms',
    technology: 'ansible',
    artifact: 'dbms.image',
    hosting: ['docker.engine', 'local.machine'],
    weight: 0.5,
    reason: 'Docker Compose is more specialized',
    details: '"community.docker.docker_container" task',

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            attributes: {
                application_address: {
                    type: 'string',
                    default: LOCALHOST,
                },
                application_port: {
                    type: 'string',
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
                                            ...AnsibleDockerContainerTask({
                                                name: 'start container',
                                                container: {
                                                    name: '{{ SELF.dbms_name }}',
                                                    image: 'mysql:{{ ".artifacts::dbms_image::file" | eval }}',
                                                    network_mode: 'host',
                                                    env: {
                                                        MYSQL_ROOT_PASSWORD: '{{ SELF.dbms_password | string }}',
                                                    },
                                                },
                                            }),
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
                                        {
                                            ...AnsibleDockerContainerTask({
                                                name: 'delete container',
                                                container: {
                                                    name: '{{ SELF.dbms_name }}',
                                                    state: 'absent',
                                                },
                                            }),
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
