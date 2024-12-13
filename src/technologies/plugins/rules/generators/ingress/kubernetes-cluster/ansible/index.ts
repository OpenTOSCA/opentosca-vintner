import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleKubernetesCredentialsEnvironment,
    AnsibleOrchestratorOperation,
} from '#technologies/plugins/rules/utils/ansible'
import {KubernetesCredentials, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'ingress',
    technology: 'ansible',
    hosting: ['kubernetes.cluster'],
    weight: 0.5,

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {...KubernetesCredentials()},
            attributes: {
                application_address: {
                    type: 'string',
                    default: 'not implemented',
                },
            },
            interfaces: {
                Standard: {
                    operations: {
                        create: {
                            implementation: {
                                ...AnsibleOrchestratorOperation(),
                                environment: {
                                    ...AnsibleKubernetesCredentialsEnvironment(),
                                },
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        {
                                            name: 'apply service',
                                            'kubernetes.core.k8s': {
                                                definition: {
                                                    apiVersion: 'v1',
                                                    kind: 'Service',
                                                    metadata: {
                                                        name: '{{ SELF.application_name }}-external',
                                                        namespace: 'default',
                                                    },
                                                    spec: {
                                                        ports: [
                                                            {
                                                                name: '{{ SELF.application_protocol }}',
                                                                port: 80,
                                                                targetPort: '{{ SELF.application_port }}',
                                                            },
                                                        ],
                                                        selector: {
                                                            app: '{{ SELF.application_name }}',
                                                        },
                                                        type: 'LoadBalancer',
                                                    },
                                                },
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
