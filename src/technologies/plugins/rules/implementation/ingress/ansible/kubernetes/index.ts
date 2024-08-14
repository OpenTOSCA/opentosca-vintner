import {ImplementationGenerator} from '#technologies/plugins/rules/implementation/types'
import {KubernetesCredentials, MetadataGenerated} from '#technologies/plugins/rules/implementation/utils'

const generator: ImplementationGenerator = {
    id: 'ingress::ansible::kubernetes',
    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {...MetadataGenerated()},
            properties: {...KubernetesCredentials()},
            attributes: {
                // TODO: implement this
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
                                primary: 'Ansible',
                                operation_host: 'ORCHESTRATOR',
                                environment: {
                                    K8S_AUTH_HOST: {
                                        eval: '.::k8s_host',
                                    },
                                    K8S_AUTH_SSL_CA_CERT: {
                                        eval: '.::k8s_ca_cert_file',
                                    },
                                    K8S_AUTH_CERT_FILE: {
                                        eval: '.::k8s_client_cert_file',
                                    },
                                    K8S_AUTH_KEY_FILE: {
                                        eval: '.::k8s_client_key_file',
                                    },
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
