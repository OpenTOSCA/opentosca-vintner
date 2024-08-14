import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {KubernetesCredentials, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    id: 'mysql.dbms::ansible::kubernetes',
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
                        eval: '.::dbms_name',
                    },
                },
                application_port: {
                    type: 'integer',
                    default: 3306,
                },
                management_address: {
                    type: 'string',
                    default: {
                        eval: '.::application_address',
                    },
                },
                management_port: {
                    type: 'integer',
                    default: {
                        eval: '.::application_port',
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
                                                        name: '{{ SELF.dbms_name }}',
                                                        namespace: 'default',
                                                    },
                                                    spec: {
                                                        selector: {
                                                            matchLabels: {
                                                                app: '{{ SELF.dbms_name }}',
                                                            },
                                                        },
                                                        template: {
                                                            metadata: {
                                                                labels: {
                                                                    app: '{{ SELF.dbms_name }}',
                                                                },
                                                            },
                                                            spec: {
                                                                containers: [
                                                                    {
                                                                        image: '{{ SELF.dbms_image }}',
                                                                        name: '{{ SELF.dbms_name }}',
                                                                        env: [
                                                                            {
                                                                                name: 'MYSQL_ROOT_PASSWORD',
                                                                                value: '{{ SELF.dbms_password }}',
                                                                            },
                                                                        ],
                                                                        ports: [
                                                                            {
                                                                                containerPort: 3306,
                                                                                name: 'mysql',
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
                                                        name: '{{ SELF.dbms_name }}',
                                                        namespace: 'default',
                                                    },
                                                    spec: {
                                                        ports: [
                                                            {
                                                                name: 'mysql',
                                                                port: 3306,
                                                                targetPort: 3306,
                                                            },
                                                        ],
                                                        selector: {
                                                            app: '{{ SELF.dbms_name }}',
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

export default generator
