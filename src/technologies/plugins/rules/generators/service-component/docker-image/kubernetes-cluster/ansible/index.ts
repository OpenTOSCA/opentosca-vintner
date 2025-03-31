import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleKubernetesCredentialsEnvironment,
    AnsibleOrchestratorOperation,
} from '#technologies/plugins/rules/utils/ansible'
import {
    ApplicationProperties,
    KubernetesCredentials,
    MetadataGenerated,
    MetadataUnfurl,
} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'service.component',
    technology: 'ansible',
    artifact: 'docker.image',
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
                                                                        image: '{{ ".artifacts::docker_image::file" | eval }}',
                                                                        name: '{{ SELF.application_name }}',
                                                                        env: ApplicationProperties(type).toList(),
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
                                                namespace: 'default',
                                                name: '{{ SELF.application_name }}',
                                            },
                                        },
                                        {
                                            name: 'delete deployment',
                                            'kubernetes.core.k8s': {
                                                state: 'absent',
                                                api_version: 'app/v1',
                                                kind: 'Deployment',
                                                namespace: 'default',
                                                name: '{{ SELF.application_name }}',
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
