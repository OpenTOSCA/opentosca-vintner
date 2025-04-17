import {NodeType} from '#spec/node-type'
import {GeneratorAbstract} from '#technologies/plugins/rules/types'
import {TerraformStandardOperations} from '#technologies/plugins/rules/utils/terraform'
import {
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
    OpenstackMachineHost,
} from '#technologies/plugins/rules/utils/utils'

class Generator extends GeneratorAbstract {
    component = 'mysql.database'
    technology = 'terraform'
    artifact = undefined
    hosting = ['mysql.dbms', 'remote.machine']
    weight = 0.5

    generate(name: string, type: NodeType) {
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
                ...TerraformStandardOperations(),
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
                                                host: '{{ HOST.application_address }}',
                                                port: '{{ HOST.application_port }}',
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
    }
}

export default new Generator()
