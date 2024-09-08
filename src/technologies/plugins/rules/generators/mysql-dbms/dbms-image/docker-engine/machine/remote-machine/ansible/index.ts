import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleDockerContainerTask,
    AnsibleHostOperation,
    AnsibleHostOperationPlaybookArgs,
    AnsibleWaitForSSHTask,
} from '#technologies/plugins/rules/utils/ansible'
import {
    LOCALHOST,
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'mysql.dbms',
    technology: 'ansible',
    artifact: 'dbms.image',
    hosting: ['docker.engine', 'remote.machine'],
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
            properties: {...OpenstackMachineCredentials()},
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
                                ...AnsibleHostOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        {
                                            ...AnsibleWaitForSSHTask(),
                                        },
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
                                playbookArgs: [...AnsibleHostOperationPlaybookArgs()],
                            },
                        },
                        delete: {
                            implementation: {
                                ...AnsibleHostOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        {
                                            ...AnsibleWaitForSSHTask(),
                                        },
                                        {
                                            ...AnsibleDockerContainerTask({
                                                name: 'stop container',
                                                container: {
                                                    name: '{{ SELF.application_name }}',
                                                    state: 'absent',
                                                },
                                            }),
                                        },
                                    ],
                                },
                                playbookArgs: [...AnsibleHostOperationPlaybookArgs()],
                            },
                        },
                    },
                },
            },
        }
    },
}

export default generator
