import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
    OpenstackMachineHost,
} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    id: 'mysql.database::terraform::mysql.dbms::docker.engine',
    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {
                ...OpenstackMachineCredentials(),
                ...OpenstackMachineHost(),
            },
            interfaces: {
                Standard: {
                    operations: {
                        configure: {
                            implementation: {
                                primary: 'Terraform',
                            },
                        },
                        delete: {
                            implementation: {
                                primary: 'Terraform',
                            },
                        },
                    },
                },
                defaults: {
                    inputs: {
                        main: {
                            terraform: [
                                {
                                    required_providers: [
                                        {
                                            mysql: {
                                                source: 'petoju/mysql',
                                                version: '3.0.48',
                                            },
                                            ssh: {
                                                source: 'AndrewChubatiuk/ssh',
                                                version: '0.2.3',
                                            },
                                        },
                                    ],
                                },
                            ],
                            data: {
                                ssh_tunnel: {
                                    mysql: [
                                        {
                                            remote: {
                                                port: 3306,
                                            },
                                        },
                                    ],
                                },
                            },
                            provider: {
                                mysql: [
                                    {
                                        endpoint: '${data.ssh_tunnel.mysql.local.address}',
                                        password: '{{ HOST.dbms_password }}',
                                        username: 'root',
                                    },
                                ],
                                ssh: [
                                    {
                                        auth: {
                                            private_key: {
                                                content: '${file(pathexpand("{{ SELF.os_ssh_key_file }}"))}',
                                            },
                                        },
                                        server: {
                                            host: '{{ HOST.management_address }}',
                                            port: 22,
                                        },
                                        user: '{{ SELF.os_ssh_user }}',
                                    },
                                ],
                            },
                            resource: {
                                mysql_database: {
                                    database: [
                                        {
                                            name: '{{ SELF.database_name }}',
                                        },
                                    ],
                                },
                                mysql_user: {
                                    user: [
                                        {
                                            host: '%',
                                            plaintext_password: '{{ SELF.database_password }}',
                                            user: '{{ SELF.database_user }}',
                                        },
                                    ],
                                },
                                mysql_grant: {
                                    user: [
                                        {
                                            database: '{{ SELF.database_name }}',
                                            host: '%',
                                            table: '*',
                                            privileges: ['ALL'],
                                            user: '${mysql_user.user.user}',
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
