import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleAptTask,
    AnsibleDockerContainerTask,
    AnsibleHostOperation,
    AnsibleHostOperationPlaybookArgs,
    AnsibleMySQLDatabaseTask,
    AnsibleMySQLUserTask,
    AnsibleWaitForSSHTask,
} from '#technologies/plugins/rules/utils/ansible'
import {MetadataGenerated, MetadataUnfurl, OpenstackMachineCredentials} from '#technologies/plugins/rules/utils/utils'

/**
 * Inspiration
 *
 * - https://stackoverflow.com/questions/70477529/is-there-a-docker-daemon-equivalent-to-kubectl-port-forward
 * - https://stackoverflow.com/questions/65537166/is-there-a-kubectl-port-forward-equivalent-in-podman
 */
const generator: ImplementationGenerator = {
    component: 'mysql.database',
    technology: 'ansible',
    hosting: ['mysql.dbms', 'docker.engine', 'remote.machine'],
    weight: 1,
    reason: 'The MySQL database is hosted on a MySQL DBMS on a Docker engine on a remote machine. Ansible and Terraform offer declarative modules for managing a MySQL database. However, in contrast to Terraform, Ansible provides native features to access the MySQL DBMS using SSH.',

    generate: (name, type) => {
        const user = {
            name: '{{ SELF.database_user }}',
            password: '{{ SELF.database_password }}',
            host: '%',
            priv: '*.*:ALL',
        }

        const login = {
            login_host: '{{ HOST.application_address }}',
            login_password: '{{ HOST.dbms_password }}',
            login_port: '{{ HOST.application_port }}',
            login_user: 'root',
        }

        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {
                ...OpenstackMachineCredentials(),
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
                                            ...AnsibleAptTask({
                                                name: 'install pip',
                                                apt: {
                                                    name: 'python3-pip',
                                                    state: 'present',
                                                },
                                            }),
                                        },
                                        {
                                            name: 'install pymysql',
                                            'ansible.builtin.pip': {
                                                name: 'pymysql',
                                                state: 'present',
                                            },
                                        },
                                        {
                                            name: 'get dbms container info',
                                            'community.docker.docker_container_info': {
                                                name: '{{ HOST.dbms_name }}',
                                            },
                                            register: 'dbms_container_info',
                                        },
                                        {
                                            ...AnsibleDockerContainerTask({
                                                name: 'forward port',
                                                container: {
                                                    name: '{{ HOST.dbms_name }}-port-forward',
                                                    image: 'nicolaka/netshoot:v0.13',
                                                    command:
                                                        'socat TCP6-LISTEN:3306,fork TCP:{{ HOST.dbms_name }}:3306',
                                                    ports: ['{{ HOST.application_port }}:3306'],
                                                },
                                                when: "'host' not in dbms_container_info.container.NetworkSettings.Networks",
                                            }),
                                        },
                                        {
                                            name: 'create forwarding network',
                                            'community.docker.docker_network': {
                                                name: '{{ HOST.dbms_name }}-port-forward',
                                                connected: [
                                                    '{{ HOST.dbms_name }}-port-forward',
                                                    '{{ HOST.dbms_name }}',
                                                ],
                                            },
                                            when: "'host' not in dbms_container_info.container.NetworkSettings.Networks",
                                        },
                                        {
                                            ...AnsibleMySQLDatabaseTask({
                                                name: 'create database',
                                                database: {
                                                    name: '{{ SELF.database_name }}',
                                                    ...login,
                                                },
                                            }),
                                        },
                                        {
                                            ...AnsibleMySQLUserTask({
                                                name: 'create user (with privileges)',
                                                user: {
                                                    ...user,
                                                    ...login,
                                                },
                                            }),
                                        },
                                        {
                                            ...AnsibleDockerContainerTask({
                                                name: 'unforward port',
                                                container: {
                                                    name: '{{ HOST.dbms_name }}-port-forward',
                                                    state: 'absent',
                                                },
                                                when: "'host' not in dbms_container_info.container.NetworkSettings.Networks",
                                            }),
                                        },
                                        {
                                            name: 'remove forwarding network',
                                            'community.docker.docker_network': {
                                                name: '{{ HOST.dbms_name }}-port-forward',
                                                state: 'absent',
                                            },
                                            when: "'host' not in dbms_container_info.container.NetworkSettings.Networks",
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
                                            ...AnsibleMySQLUserTask({
                                                name: 'delete user (with privileges)',
                                                user: {
                                                    state: 'absent',
                                                    ...user,
                                                    ...login,
                                                },
                                            }),
                                        },
                                        {
                                            ...AnsibleMySQLDatabaseTask({
                                                name: 'delete database',
                                                database: {
                                                    name: '{{ SELF.database_name }}',
                                                    state: 'absent',
                                                    ...login,
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
