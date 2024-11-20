import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    TerraformKubernetesProviderConfiguration,
    TerraformKubernetesProviderImport,
    TerraformRequiredVersion,
    TerraformStandardOperations,
} from '#technologies/plugins/rules/utils/terraform'
import {KubernetesCredentials, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'ingress',
    technology: 'terraform',
    hosting: ['kubernetes.cluster'],
    weight: 0.5,
    reason: 'Kubernetes is more specialized.',

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {...KubernetesCredentials()},
            attributes: {
                // TODO: application address
                application_address: {
                    type: 'string',
                    default: 'not implemented',
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
                                            kubernetes: {
                                                ...TerraformKubernetesProviderImport(),
                                            },
                                        },
                                    ],
                                    ...TerraformRequiredVersion(),
                                },
                            ],
                            provider: {
                                kubernetes: [
                                    {
                                        ...TerraformKubernetesProviderConfiguration(),
                                    },
                                ],
                            },
                            resource: {
                                kubernetes_service_v1: {
                                    application: [
                                        {
                                            metadata: [
                                                {
                                                    name: '{{ SELF.application_name }}-external',
                                                },
                                            ],
                                            wait_for_load_balancer: false,
                                            spec: [
                                                {
                                                    port: [
                                                        {
                                                            name: '{{ SELF.application_protocol }}',
                                                            port: 80,
                                                            target_port: '{{ SELF.application_port }}',
                                                        },
                                                    ],
                                                    selector: {
                                                        app: '{{ SELF.application_name }}',
                                                    },
                                                    type: 'LoadBalancer',
                                                },
                                            ],
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
