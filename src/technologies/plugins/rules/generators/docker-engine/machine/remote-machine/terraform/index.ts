import {
    DockerEngineServiceUnit,
    TerraformDockerEngineInstallationTasks,
    TerraformDockerEngineUninstallationTasks,
} from '#technologies/plugins/rules/generators/docker-engine/machine/utils'
import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    TerraformRequiredVersion,
    TerraformSSHConnection,
    TerraformStandardOperations,
} from '#technologies/plugins/rules/utils/terraform'
import {
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
    OpenstackMachineHost,
} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'docker.engine',
    technology: 'terraform',
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
            },
            attributes: {
                application_address: {
                    type: 'string',
                    default: '127.0.0.1',
                },
            },

            interfaces: {
                ...TerraformStandardOperations(),
                defaults: {
                    inputs: {
                        main: {
                            terraform: [
                                {
                                    ...TerraformRequiredVersion(),
                                },
                            ],
                            resource: {
                                terraform_data: {
                                    docker: [
                                        {
                                            connection: [
                                                {
                                                    ...TerraformSSHConnection(),
                                                },
                                            ],
                                            provisioner: {
                                                file: [
                                                    {
                                                        content: DockerEngineServiceUnit(),
                                                        destination: '/tmp/docker.service',
                                                    },
                                                ],
                                                'remote-exec': [
                                                    {
                                                        inline: [...TerraformDockerEngineInstallationTasks()],
                                                    },
                                                    {
                                                        inline: [...TerraformDockerEngineUninstallationTasks()],
                                                        when: 'destroy',
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
