import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    GCPProviderCredentials,
    MetadataGenerated,
    MetadataUnfurl,
    TerraformStandardOperations,
} from '#technologies/plugins/rules/utils'

// TODO: next: implement this, see https://registry.terraform.io/providers/aminueza/minio/latest

const generator: ImplementationGenerator = {
    component: 'bucket',
    technology: 'terraform',
    hosting: ['minio.server', 'kubernetes.cluster'],
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
