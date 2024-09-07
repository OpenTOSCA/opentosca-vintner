import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {TerraformStandardOperations} from '#technologies/plugins/rules/utils/terraform'
import {GCPProviderCredentials, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

// TODO: next: implement this, see https://registry.terraform.io/providers/aminueza/minio/latest

const generator: ImplementationGenerator = {
    component: 'redis.server',
    technology: 'terraform',
    artifact: 'cache.image',
    hosting: ['kubernetes.cluster'],
    weight: 1,
    reason: 'Terraform provides a declarative module.',

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {
                ...GCPProviderCredentials(),
            },

            interfaces: {
                ...TerraformStandardOperations({
                    GOOGLE_APPLICATION_CREDENTIALS: {
                        eval: '.::gcp_service_account_file',
                    },
                }),
                defaults: {
                    inputs: {
                        main: {
                            terraform: [],
                            provider: {},
                            resource: {},
                        },
                    },
                },
            },
        }
    },
}

export default generator
