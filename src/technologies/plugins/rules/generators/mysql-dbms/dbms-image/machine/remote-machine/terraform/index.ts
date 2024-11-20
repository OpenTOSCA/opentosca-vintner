import {
    BashMySQLDBMSInstallation,
    BashMySQLDBMSInstallationScript,
} from '#technologies/plugins/rules/generators/mysql-dbms/dbms-image/machine/utils'
import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {AnsibleHostEndpointCapability} from '#technologies/plugins/rules/utils/ansible'
import {TerraformSSHConnection, TerraformStandardOperations} from '#technologies/plugins/rules/utils/terraform'
import {
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
    OpenstackMachineHost,
} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'mysql.dbms',
    technology: 'terraform',
    artifact: 'dbms.image',
    hosting: ['remote.machine'],
    weight: 0,
    reason: 'Ansible is more specialized. Also using provisioners is a "last resort".',

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
                ...TerraformStandardOperations(),
                defaults: {
                    inputs: {
                        main: {
                            resource: {
                                terraform_data: {
                                    vm: [
                                        {
                                            connection: [
                                                {
                                                    ...TerraformSSHConnection(),
                                                },
                                            ],
                                            provisioner: {
                                                file: [
                                                    {
                                                        content: BashMySQLDBMSInstallationScript,
                                                        destination: '/tmp/install-mysql-dbms.sh',
                                                    },
                                                ],
                                                'remote-exec': [
                                                    {
                                                        inline: [BashMySQLDBMSInstallation],
                                                    },
                                                ],
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
