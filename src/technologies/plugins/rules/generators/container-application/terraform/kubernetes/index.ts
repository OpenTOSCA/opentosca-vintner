import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    KubernetesCredentials,
    MetadataGenerated,
    MetadataUnfurl,
    mapProperties,
} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    id: 'container.application::terraform::kubernetes',
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
                    default: {
                        eval: '.::application_name',
                    },
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
                                kubernetes_deployment_v1: {
                                    application: [
                                        {
                                            metadata: [
                                                {
                                                    name: '{{ SELF.application_name }}',
                                                },
                                            ],
                                            spec: [
                                                {
                                                    selector: [
                                                        {
                                                            match_labels: {
                                                                app: '{{ SELF.application_name }}',
                                                            },
                                                        },
                                                    ],
                                                    template: [
                                                        {
                                                            metadata: [
                                                                {
                                                                    labels: {
                                                                        app: '{{ SELF.application_name }}',
                                                                    },
                                                                },
                                                            ],
                                                            spec: [
                                                                {
                                                                    container: [
                                                                        {
                                                                            env: mapProperties(type),
                                                                            image: '{{ SELF.application_image }}',
                                                                            name: '{{ SELF.application_name }}',
                                                                            port: [
                                                                                {
                                                                                    container_port:
                                                                                        '{{ SELF.application_port }}',
                                                                                },
                                                                            ],
                                                                        },
                                                                    ],
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                                kubernetes_service_v1: {
                                    application: [
                                        {
                                            metadata: [
                                                {
                                                    name: '{{ SELF.application_name }}',
                                                },
                                            ],
                                            spec: [
                                                {
                                                    port: [
                                                        {
                                                            name: '{{ SELF.application_protocol }}',
                                                            port: '{{ SELF.application_port }}',
                                                            target_port: '{{ SELF.application_port }}',
                                                        },
                                                    ],
                                                    selector: {
                                                        app: '{{ SELF.application_name }}',
                                                    },
                                                    type: 'ClusterIP',
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
