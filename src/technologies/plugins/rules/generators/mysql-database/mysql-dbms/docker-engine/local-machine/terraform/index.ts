import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {TerraformStandardOperations} from '#technologies/plugins/rules/utils/terraform'
import {
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
    OpenstackMachineHost,
} from '#technologies/plugins/rules/utils/utils'

// TODO: we assume that dbms is exposed

const generator: ImplementationGenerator = {
    component: 'mysql.database',
    technology: 'terraform',
    hosting: ['mysql.dbms', 'docker.engine', 'local.machine'],

    // TODO: what is about the weight? SSH workaround not used anymore
    weight: 0.5,
    reason: 'Terraform provides a declarative module. However, Terraform requires an SSH workaround. Ansible is more specialized.',

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
                                        endpoint: '127.0.0.1:{{ HOST.management_port }}',
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
    },
}

export default generator
