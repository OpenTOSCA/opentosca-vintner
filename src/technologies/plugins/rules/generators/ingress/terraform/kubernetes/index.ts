import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {KubernetesCredentials, MetadataGenerated} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    id: 'ingress::terraform::kubernetes',
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
                        configure: {
                            implementation: {
                                primary: 'Terraform',
                            },
                        },
                        delete: {
                            implementation: {
                                primary: 'Terraform',
                            },
                        },
                    },
                },
                defaults: {
                    inputs: {
                        main: {
                            terraform: [
                                {
                                    required_providers: [
                                        {
                                            kubernetes: {
                                                source: 'hashicorp/kubernetes',
                                                version: '2.31.0',
                                            },
                                        },
                                    ],
                                    required_version: '>= 0.14.0',
                                },
                            ],
                            provider: {
                                kubernetes: [
                                    {
                                        client_certificate: '${file("{{ SELF.k8s_client_cert_file }}")}',
                                        client_key: '${file("{{ SELF.k8s_client_key_file }}")}',
                                        cluster_ca_certificate: '${file("{{ SELF.k8s_ca_cert_file }}")}',
                                        host: '{{ SELF.k8s_host }}',
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
