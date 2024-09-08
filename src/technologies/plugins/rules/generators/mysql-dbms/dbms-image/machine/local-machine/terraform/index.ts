import {
    BashMySQLDBMSInstallation,
    BashMySQLDBMSInstallationScript,
} from '#technologies/plugins/rules/generators/mysql-dbms/dbms-image/machine/utils'
import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {AnsibleHostEndpointCapability} from '#technologies/plugins/rules/utils/ansible'
import {TerraformStandardOperations} from '#technologies/plugins/rules/utils/terraform'
import {LOCALHOST, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'mysql.dbms',
    technology: 'terraform',
    artifact: 'dbms.image',
    hosting: ['local.machine'],
    weight: 0,
    reason: 'Ansible is more specialized. Also using provisioners is a "last resort".',
    details:
        '"terraform_data" resource with an "ssh" connection to the virtual machine to copy the install script using the "file" provisioner on the virtual machine and to execute the script using the "remote-exec" provisioner',

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {
                application_port: {
                    type: 'string',
                    default: 3001,
                },
                application_address: {
                    type: 'string',
                    default: LOCALHOST,
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
                                local_file: {
                                    tmp_script: {
                                        content: BashMySQLDBMSInstallationScript,
                                        filename: '/tmp/install-mysql-dbms.sh',
                                    },
                                },
                                terraform_data: {
                                    local: [
                                        {
                                            depends_on: 'local_file.tmp_script',
                                            provisioner: {
                                                'local-exec': [
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
