import {
    DockerEngineServiceUnit,
    TerraformDockerEngineInstallationTasks,
    TerraformDockerEngineUninstallationTasks,
} from '#technologies/plugins/rules/generators/docker-engine/machine/utils'
import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    TerraformLocalProviderImport,
    TerraformRequiredVersion,
    TerraformStandardOperations,
} from '#technologies/plugins/rules/utils/terraform'
import {LOCALHOST, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'docker.engine',
    technology: 'terraform',
    hosting: ['local.machine'],
    weight: 0,
    reason: 'Ansible is more specialized. Also using provisioners is a "last resort".',
    details: '"local-exec" provider',

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            attributes: {
                application_address: {
                    type: 'string',
                    default: LOCALHOST,
                },
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
                                                ...TerraformLocalProviderImport(),
                                            },
                                        },
                                    ],
                                    ...TerraformRequiredVersion(),
                                },
                            ],
                            provider: {
                                local: [
                                    {
                                        endpoint: `${LOCALHOST}:{{ HOST.management_port }}`,
                                        password: '{{ HOST.dbms_password }}',
                                        username: 'root',
                                    },
                                ],
                            },
                            resource: {
                                local_file: {
                                    tmp_service: {
                                        content: DockerEngineServiceUnit(),
                                        filename: '/tmp/docker.service',
                                    },
                                },
                                terraform_data: {
                                    docker: [
                                        {
                                            depends_on: 'local_file.tmp_service',
                                            provisioner: {
                                                'local-exec': [
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
