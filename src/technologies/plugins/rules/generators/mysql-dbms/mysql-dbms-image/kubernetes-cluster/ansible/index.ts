import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleKubernetesCredentialsEnvironment,
    AnsibleOrchestratorOperation,
    KubernetesCredentials,
    MetadataGenerated,
    MetadataUnfurl,
} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    component: 'mysql.dbms',
    technology: 'ansible',
    artifact: 'dbms.image',
    hosting: ['kubernetes.cluster'],
    weight: 0.5,
    reason: 'Kubernetes is more specialized.',
    details: '"kubernetes.core.k8s" tasks',

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
                                ...AnsibleOrchestratorOperation(),
                                environment: {
                                    ...AnsibleKubernetesCredentialsEnvironment(),
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
                                                                        image: 'mysql:{{ ".artifacts::dbms_image::file" | eval }}',
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
                        delete: {
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
                                            name: 'delete service',
                                            'kubernetes.core.k8s': {
                                                state: 'absent',
                                                api_version: 'v1',
                                                kind: 'Service',
                                                name: '{{ SELF.dbms_name }}',
                                                namespace: 'default',
                                            },
                                        },
                                        {
                                            name: 'delete deployment',
                                            'kubernetes.core.k8s': {
                                                state: 'absent',
                                                api_version: 'apps/v1',
                                                kind: 'Deployment',
                                                name: '{{ SELF.dbms_name }}',
                                                namespace: 'default',
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
