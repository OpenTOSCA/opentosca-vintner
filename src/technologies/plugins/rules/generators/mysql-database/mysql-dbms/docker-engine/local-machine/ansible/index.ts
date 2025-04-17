import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {AnsibleOrchestratorOperation} from '#technologies/plugins/rules/utils/ansible'
import {MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'mysql.database',
    technology: 'ansible',
    hosting: ['mysql.dbms', 'docker.engine', 'local.machine'],
    weight: 1,
    reason: 'The MySQL database is hosted on a MySQL DBMS on a Docker engine on a local machine. Ansible and Terraform offer declarative modules for managing a MySQL database.',

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
                                            name: 'get dbms container info',
                                            'community.docker.docker_container_info': {
                                                name: '{{ HOST.dbms_name }}',
                                            },
                                            register: 'dbms_container_info',
                                        },
                                        {
                                            name: 'create database',
                                            'community.mysql.mysql_db': {
                                                name: '{{ SELF.database_name }}',
                                                ...login,
                                            },
                                        },
                                        {
                                            name: 'create user (with privileges)',
                                            'community.mysql.mysql_user': {
                                                ...user,
                                                ...login,
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
                                        {
                                            name: 'delete user (with privileges)',
                                            'community.mysql.mysql_user': {
                                                state: 'absent',
                                                ...user,
                                                ...login,
                                            },
                                        },
                                        {
                                            name: 'delete database',
                                            'community.mysql.mysql_db': {
                                                name: '{{ SELF.database_name }}',
                                                state: 'absent',
                                                ...login,
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
