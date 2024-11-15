import {
    TerraformMinioProviderConfiguration,
    TerraformMinioProviderImport,
    TerraformMinoBucketResources,
} from '#technologies/plugins/rules/generators/object-storage/minio/utils'
import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {TerraformRequiredVersion, TerraformStandardOperations} from '#technologies/plugins/rules/utils/terraform'
import {
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
    OpenstackMachineHost,
} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'object.storage',
    technology: 'terraform',
    hosting: ['minio.server', 'docker.engine', 'remote.machine'],
    weight: 0.75,
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
                                            minio: TerraformMinioProviderImport(),
                                            ssh: {
                                                source: 'AndrewChubatiuk/ssh',
                                                version: '0.2.3',
                                            },
                                        },
                                    ],
                                    ...TerraformRequiredVersion(),
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
                                minio: [TerraformMinioProviderConfiguration()],
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
                            resource: TerraformMinoBucketResources(),
                        },
                    },
                },
            },
        }
    },
}

export default generator
