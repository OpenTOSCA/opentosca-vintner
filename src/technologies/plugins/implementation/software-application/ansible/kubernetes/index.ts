import {TypePlugin} from '#technologies/plugins/implementation/types'
import {mapProperties} from '#technologies/plugins/implementation/utils'

const plugin: TypePlugin = {
    id: 'software.application::ansible::kubernetes',
    generate: (name, type) => {
        return {
            derived_from: name,
            properties: {
                k8s_host: {
                    type: 'string',
                    default: {
                        get_input: 'k8s_host',
                    },
                },
                k8s_ca_cert_file: {
                    type: 'string',
                    default: {
                        get_input: 'k8s_ca_cert_file',
                    },
                },
                k8s_client_cert_file: {
                    type: 'string',
                    default: {
                        get_input: 'k8s_client_cert_file',
                    },
                },
                k8s_client_key_file: {
                    type: 'string',
                    default: {
                        get_input: 'k8s_client_key_file',
                    },
                },
            },
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
                                            name: 'create deployment',
                                            'kubernetes.core.k8s': {
                                                wait: true,
                                                definition: {
                                                    apiVersion: 'apps/v1',
                                                    kind: 'Deployment',
                                                    metadata: {
                                                        name: '{{ SELF.application_name }}',
                                                        namespace: 'default',
                                                    },
                                                    spec: {
                                                        selector: {
                                                            matchLabels: {
                                                                app: '{{ SELF.application_name }}',
                                                            },
                                                        },
                                                        template: {
                                                            metadata: {
                                                                labels: {
                                                                    app: '{{ SELF.application_name }}',
                                                                },
                                                            },
                                                            spec: {
                                                                containers: [
                                                                    {
                                                                        image: '{{ SELF.application_image }}',
                                                                        name: '{{ SELF.application_name }}',
                                                                        env: mapProperties(type),
                                                                        ports: [
                                                                            {
                                                                                containerPort:
                                                                                    '{{ SELF.application_port }}',
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
                                        {
                                            name: 'create service',
                                            'kubernetes.core.k8s': {
                                                definition: {
                                                    apiVersion: 'v1',
                                                    kind: 'Service',
                                                    metadata: {
                                                        name: '{{ SELF.application_name }}',
                                                        namespace: 'default',
                                                    },
                                                    spec: {
                                                        ports: [
                                                            {
                                                                name: '{{ SELF.application_protocol }}',
                                                                port: '{{ SELF.application_port }}',
                                                                targetPort: '{{ SELF.application_port }}',
                                                            },
                                                        ],
                                                        selector: {
                                                            app: '{{ SELF.application_name }}',
                                                        },
                                                        type: 'ClusterIP',
                                                    },
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                        delete: 'exit 0',
                    },
                },
            },
        }
    },
}

export default plugin
