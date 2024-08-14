import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {KubernetesCredentials, MetadataGenerated} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    id: 'mysql.dbms::terraform::kubernetes',
    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {...MetadataGenerated()},
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
                                                    name: '{{ SELF.dbms_name }}',
                                                },
                                            ],
                                            spec: [
                                                {
                                                    selector: [
                                                        {
                                                            match_labels: {
                                                                app: '{{ SELF.dbms_name }}',
                                                            },
                                                        },
                                                    ],
                                                    template: [
                                                        {
                                                            metadata: [
                                                                {
                                                                    labels: {
                                                                        app: '{{ SELF.dbms_name }}',
                                                                    },
                                                                },
                                                            ],
                                                            spec: [
                                                                {
                                                                    container: [
                                                                        {
                                                                            name: '{{ SELF.dbms_name }}',
                                                                            image: '{{ SELF.dbms_image }}',
                                                                            env: [
                                                                                {
                                                                                    name: 'MYSQL_ROOT_PASSWORD',
                                                                                    value: '{{ SELF.dbms_password }}',
                                                                                },
                                                                            ],
                                                                            port: [
                                                                                {
                                                                                    container_port: 3306,
                                                                                    name: 'mysql',
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
                                                    name: '{{ SELF.dbms_name }}',
                                                },
                                            ],
                                            spec: [
                                                {
                                                    port: [
                                                        {
                                                            name: 'mysql',
                                                            port: 3306,
                                                            target_port: 3306,
                                                        },
                                                    ],
                                                    selector: {
                                                        app: '{{ SELF.dbms_name }}',
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
