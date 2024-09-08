import {NodeType} from '#spec/node-type'
import {GeneratorAbstract} from '#technologies/plugins/rules/types'
import {
    AnsibleHostOperation,
    AnsibleHostOperationPlaybookArgs,
    AnsibleWaitForSSHTask,
} from '#technologies/plugins/rules/utils/ansible'
import {MetadataGenerated, MetadataUnfurl, OpenstackMachineCredentials} from '#technologies/plugins/rules/utils/utils'

class Generator extends GeneratorAbstract {
    component = 'mysql.database'
    technology = 'ansible'
    artifact = undefined
    hosting = ['mysql.dbms', 'remote.machine']
    weight = 1
    reason = 'Primary use case due to the specialization of Ansible.'
    details = undefined

    generate(name: string, type: NodeType) {
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
                                            name: 'install pip',
                                            'ansible.builtin.apt': {
                                                name: 'python3-pip',
                                                state: 'present',
                                            },
                                        },
                                        {
                                            name: 'install pymysql',
                                            'ansible.builtin.pip': {
                                                name: 'pymysql',
                                                state: 'present',
                                            },
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
                                playbookArgs: [...AnsibleHostOperationPlaybookArgs()],
                            },
                        },
                    },
                },
            },
        }
    }
}

export default new Generator()
