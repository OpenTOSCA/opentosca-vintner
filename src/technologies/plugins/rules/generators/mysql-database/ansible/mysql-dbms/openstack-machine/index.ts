import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleHostOperation,
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    id: 'mysql.database::ansible::mysql.dbms::openstack.machine',
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
                                            name: 'wait for ssh',
                                            wait_for_connection: null,
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
                                playbookArgs: [
                                    '--become',
                                    '--key-file={{ SELF.os_ssh_key_file }}',
                                    '--user={{ SELF.os_ssh_user }}',
                                ],
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
