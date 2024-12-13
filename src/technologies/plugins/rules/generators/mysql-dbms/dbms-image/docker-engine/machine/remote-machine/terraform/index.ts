import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {AnsibleHostEndpointCapability} from '#technologies/plugins/rules/utils/ansible'
import {
    TerraformDockerProviderImport,
    TerraformDockerProviderRemoteConfiguration,
    TerraformRequiredVersion,
    TerraformStandardOperations,
} from '#technologies/plugins/rules/utils/terraform'
import {
    LOCALHOST,
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
    OpenstackMachineHost,
} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'mysql.dbms',
    technology: 'terraform',
    artifact: 'dbms.image',
    hosting: ['docker.engine', 'remote.machine'],
    weight: 0.5,

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
                    default: LOCALHOST,
                },
                application_port: {
                    type: 'integer',
                    default: 3306,
                },
                management_address: {
                    type: 'string',
                    default: {
                        eval: '.::.requirements::[.name=host]::.target::management_address',
                    },
                },
                management_port: {
                    type: 'integer',
                    default: 3306,
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
                            terraform: [
                                {
                                    required_providers: [
                                        {
                                            docker: {
                                                ...TerraformDockerProviderImport(),
                                            },
                                        },
                                    ],
                                    ...TerraformRequiredVersion(),
                                },
                            ],
                            provider: {
                                docker: [
                                    {
                                        ...TerraformDockerProviderRemoteConfiguration(),
                                    },
                                ],
                            },
                            resource: {
                                docker_container: {
                                    application: [
                                        {
                                            name: '{{ SELF.dbms_name }}',
                                            image: '${docker_image.image.image_id}',
                                            network_mode: 'host',
                                            env: ['MYSQL_ROOT_PASSWORD={{ SELF.dbms_password }}'],
                                        },
                                    ],
                                },
                                docker_image: {
                                    image: [
                                        {
                                            name: 'mysql:{{ ".artifacts::dbms_image::file" | eval }}',
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
