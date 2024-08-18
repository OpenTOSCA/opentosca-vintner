import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleHostEndpointCapability,
    AnsibleHostOperation,
    AnsibleHostOperationPlaybookArgs,
    AnsibleWaitForSSHTask,
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    component: 'mysql.dbms',
    technology: 'ansible',
    hosting: ['virtual.machine'],

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
                    default: '127.0.0.1',
                },
                application_port: {
                    type: 'string',
                    default: 3000,
                },
                management_address: {
                    type: 'string',
                    default: {
                        eval: '.::.requirements::[.name=host]::.target::management_address',
                    },
                },
                management_port: {
                    type: 'integer',
                    default: 3000,
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
                                ...AnsibleHostOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        {
                                            ...AnsibleWaitForSSHTask(),
                                        },
                                        {
                                            name: 'Installing mysql',
                                            package: {
                                                name: '{{item}}',
                                                state: 'present',
                                                update_cache: 'yes',
                                            },
                                            loop: [
                                                'mysql-server',
                                                'mysql-client',
                                                'python3-mysqldb',
                                                'libmysqlclient-dev',
                                            ],
                                        },
                                        {
                                            name: 'Start and enable mysql service',
                                            service: {
                                                name: 'mysql',
                                                state: 'started',
                                                enabled: 'yes',
                                            },
                                        },
                                        {
                                            name: 'Create mysql user',
                                            'community.mysql.mysql_user': {
                                                name: 'root',
                                                password: '{{ SELF.root_password }}',
                                                priv: '*.*:ALL',
                                                host: '%',
                                                state: 'present',
                                            },
                                        },
                                        {
                                            name: 'Delete localhost root',
                                            'community.mysql.mysql_user': {
                                                name: 'root',
                                                host: 'localhost',
                                                state: 'absent',
                                            },
                                        },
                                        {
                                            name: 'Enable passwordless login',
                                            copy: {
                                                dest: '/root/.my.cnf',
                                                content: '[client]\nuser=root\npassword={{ SELF.root_password }}\n',
                                            },
                                        },
                                        {
                                            name: 'Enable remote login',
                                            lineinfile: {
                                                path: '/etc/mysql/mysql.conf.d/mysqld.cnf',
                                                regexp: '^bind-address',
                                                line: 'bind-address = 0.0.0.0',
                                                backup: 'yes',
                                            },
                                        },
                                        {
                                            name: 'Configure port (e.g., since 3306 is blocked by the provider)',
                                            lineinfile: {
                                                path: '/etc/mysql/mysql.conf.d/mysqld.cnf',
                                                regexp: '^# port',
                                                line: 'port = 3000',
                                                backup: 'yes',
                                            },
                                        },
                                        {
                                            name: 'Restart mysql',
                                            service: {
                                                name: 'mysql',
                                                state: 'restarted',
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
