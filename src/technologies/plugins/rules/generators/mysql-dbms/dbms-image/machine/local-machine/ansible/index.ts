import {
    AnsibleMySQLDBMSInstallationTasks,
    AnsibleMySQLDBMSUninstallation,
} from '#technologies/plugins/rules/generators/mysql-dbms/dbms-image/machine/utils'
import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {AnsibleHostEndpointCapability, AnsibleOrchestratorOperation} from '#technologies/plugins/rules/utils/ansible'
import {LOCALHOST, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'mysql.dbms',
    technology: 'ansible',
    artifact: 'dbms.image',
    hosting: ['local.machine'],
    weight: 1,
    reason: 'The MySQL DBMS is hosted on a local machine. Ansible is specialized for installing software components on local targets, while Terraform discourages from being used to manage such scenarios.',

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
                Standard: {
                    operations: {
                        create: {
                            implementation: {
                                ...AnsibleOrchestratorOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: AnsibleMySQLDBMSInstallationTasks(),
                                },
                            },
                        },
                        delete: {
                            implementation: {
                                ...AnsibleOrchestratorOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: AnsibleMySQLDBMSUninstallation(),
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
