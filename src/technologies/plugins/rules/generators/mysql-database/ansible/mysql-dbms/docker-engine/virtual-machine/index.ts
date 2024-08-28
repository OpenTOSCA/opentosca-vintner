import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleHostOperation,
    AnsibleHostOperationPlaybookArgs,
    AnsibleWaitForSSHTask,
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
} from '#technologies/plugins/rules/utils'

// TODO: we assume that dbms is exposed

// TODO: could use https://stackoverflow.com/questions/70477529/is-there-a-docker-daemon-equivalent-to-kubectl-port-forward or https://stackoverflow.com/questions/65537166/is-there-a-kubectl-port-forward-equivalent-in-podman

// Could use "docker exec" but then its imperative ...
// Maybe one can ssh tunnel the dbms in container to local

const generator: ImplementationGenerator = {
    component: 'mysql.database',
    technology: 'ansible',
    hosting: ['mysql.dbms', 'docker.engine', 'virtual.machine'],
    weight: 1,
    reasoning: 'Primary use case due to the specialization of Ansible.',

    generate: (name, type) => {
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
                                            name: 'install pip',
                                            apt: {
                                                name: 'python3-pip',
                                                state: 'present',
                                            },
                                        },
                                        {
                                            name: 'install pymysql',
                                            pip: {
                                                name: 'pymysql',
                                                state: 'present',
                                            },
                                        },
                                        {
                                            name: 'create database',
                                            'community.mysql.mysql_db': {
                                                name: '{{ SELF.database_name }}',
                                                login_host: '{{ HOST.application_address }}',
                                                login_password: '{{ HOST.dbms_password }}',
                                                login_port: '{{ HOST.application_port }}',
                                                login_user: 'root',
                                            },
                                        },
                                        {
                                            name: 'create user (with privileges)',
                                            'community.mysql.mysql_user': {
                                                name: '{{ SELF.database_user }}',
                                                password: '{{ SELF.database_password }}',
                                                host: '%',
                                                priv: '*.*:ALL',
                                                login_host: '{{ HOST.application_address }}',
                                                login_password: '{{ HOST.dbms_password }}',
                                                login_port: '{{ HOST.application_port }}',
                                                login_user: 'root',
                                            },
                                        },
                                    ],
                                },
                                playbookArgs: [...AnsibleHostOperationPlaybookArgs()],
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
