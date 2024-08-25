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

// TODO: ensure dbms_version is installed

/**
 * apt-get install sudo wget lsb-release gnupg -y
 *
 * wget https://dev.mysql.com/get/mysql-apt-config_0.8.17-1_all.deb
 * sudo dpkg -i mysql-apt-config_0.8.17-1_all.deb
 */

const generator: ImplementationGenerator = {
    component: 'mysql.dbms',
    technology: 'ansible',
    hosting: ['virtual.machine'],
    weight: 1,
    comment: 'Primary use case due to the specialization of Ansible.',

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {
                ...OpenstackMachineCredentials(),
                application_port: {
                    type: 'string',
                    default: 3001,
                },
                application_address: {
                    type: 'string',
                    default: '127.0.0.1',
                },
            },
            attributes: {
                management_address: {
                    type: 'string',
                    default: {
                        eval: '.::.requirements::[.name=host]::.target::management_address',
                    },
                },
                management_port: {
                    type: 'integer',
                    default: {eval: '.::application_port'},
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
                                            name: 'Enable passwordless login (root)',
                                            copy: {
                                                dest: '/root/.my.cnf',
                                                content: '[client]\nuser=root\npassword={{ SELF.dbms_password }}\n',
                                            },
                                        },
                                        {
                                            name: 'Enable passwordless login (current)',
                                            copy: {
                                                dest: `/home/{{ SELF.os_ssh_user }}/.my.cnf`,
                                                content: '[client]\nuser=root\npassword={{ SELF.dbms_password }}\n',
                                            },
                                        },
                                        {
                                            name: 'Configure port (e.g., since 3306 is blocked by the provider)',
                                            lineinfile: {
                                                path: '/etc/mysql/mysql.conf.d/mysqld.cnf',
                                                regexp: '^# port',
                                                line: 'port = {{ SELF.application_port }}',
                                                backup: 'yes',
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
                                            name: 'Restart mysql',
                                            service: {
                                                name: 'mysql',
                                                state: 'restarted',
                                            },
                                        },
                                        {
                                            name: 'Create all root',
                                            'community.mysql.mysql_user': {
                                                name: 'root',
                                                password: '{{ SELF.dbms_password }}',
                                                priv: '*.*:ALL',
                                                host: '%',
                                                state: 'present',
                                                login_host: 'localhost',
                                                login_password: '{{ SELF.dbms_password }}',
                                                login_port: '{{ SELF.application_port }}',
                                                login_user: 'root',
                                            },
                                        },
                                        {
                                            name: 'Delete localhost root',
                                            'community.mysql.mysql_user': {
                                                name: 'root',
                                                host: 'localhost',
                                                state: 'absent',
                                                login_host: 'localhost',
                                                login_password: '{{ SELF.dbms_password }}',
                                                login_port: '{{ SELF.application_port }}',
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
