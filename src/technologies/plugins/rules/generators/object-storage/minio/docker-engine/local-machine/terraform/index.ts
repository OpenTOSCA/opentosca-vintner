import {
    TerraformMinioProviderConfiguration,
    TerraformMinioProviderImport,
    TerraformMinoBucketResources,
} from '#technologies/plugins/rules/generators/object-storage/minio/utils'
import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {TerraformRequiredVersion, TerraformStandardOperations} from '#technologies/plugins/rules/utils/terraform'
import {MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'object.storage',
    technology: 'terraform',
    hosting: ['minio.server', 'docker.engine', 'local.machine'],
    weight: 1,
    reason: 'Terraform provides a declarative module.',

    generate: (name, type) => {
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
                                            minio: TerraformMinioProviderImport(),
                                        },
                                    ],
                                    ...TerraformRequiredVersion(),
                                },
                            ],
                            provider: {
                                minio: [TerraformMinioProviderConfiguration()],
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
