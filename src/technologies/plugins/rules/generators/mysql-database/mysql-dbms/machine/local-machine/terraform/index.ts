import {NodeType} from '#spec/node-type'
import {GeneratorAbstract} from '#technologies/plugins/rules/types'
import {TerraformStandardOperations} from '#technologies/plugins/rules/utils/terraform'
import {MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

class Generator extends GeneratorAbstract {
    component = 'mysql.database'
    technology = 'terraform'
    artifact = undefined
    hosting = ['mysql.dbms', 'local.machine']
    weight = 1
    reason = 'Terraform provides a declarative module.'
    details = undefined

    generate(name: string, type: NodeType) {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
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
                                        },
                                    ],
                                },
                            ],
                            provider: {
                                mysql: [
                                    {
                                        endpoint: '{{ HOST.application_address }}:{{ HOST.application_port }}',
                                        password: '{{ HOST.dbms_password }}',
                                        username: 'root',
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
