import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {AnsibleOrchestratorOperation} from '#technologies/plugins/rules/utils/ansible'
import {
    ApplicationProperties,
    BASH_KUBECTL,
    MetadataGenerated,
    MetadataUnfurl,
} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'redis.server',
    technology: 'kubernetes',
    artifact: 'cache.image',
    hosting: ['kubernetes.cluster'],
    weight: 1,
    reason: 'The redis server is hosted on a Kubernetes cluster. Kubernetes provides its own natively integrated deployment technology.',

    generate: (name, type) => {
        const AnsibleTouchManifestTask = {
            name: 'touch manifest',
            register: 'manifest',
            'ansible.builtin.tempfile': {
                suffix: '{{ SELF.application_name }}.application.manifest.yaml',
            },
        }

        const AnsibleCreateManifestTak = {
            name: 'create manifest',
            'ansible.builtin.copy': {
                dest: '{{ manifest.path }}',
                content: '{{ deployment | to_yaml }}\n---\n{{ service | to_yaml }}\n',
            },
            vars: {
                deployment: {
                    apiVersion: 'apps/v1',
                    kind: 'Deployment',
                    metadata: {
                        name: '{{ SELF.cache_name }}',
                        namespace: 'default',
                    },
                    spec: {
                        selector: {
                            matchLabels: {
                                app: '{{ SELF.cache_name }}',
                            },
                        },
                        template: {
                            metadata: {
                                labels: {
                                    app: '{{ SELF.cache_name }}',
                                },
                            },
                            spec: {
                                containers: [
                                    {
                                        image: 'redis:{{ ".artifacts::cache_image::file" | eval }}',
                                        name: '{{ SELF.cache_name }}',
                                        env: ApplicationProperties(type).toList(),
                                        command: 'redis --port {{ SELF.application_port }}',
                                        ports: [
                                            {
                                                containerPort: '{{ SELF.cache_port }}',
                                            },
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                },
                service: {
                    apiVersion: 'v1',
                    kind: 'Service',
                    metadata: {
                        name: '{{ SELF.cache_name }}',
                        namespace: 'default',
                    },
                    spec: {
                        ports: [
                            {
                                name: 'redis',
                                port: '{{ SELF.cache_port }}',
                                targetPort: '{{ SELF.cache_port }}',
                            },
                        ],
                        selector: {
                            app: '{{ SELF.cache_name }}',
                        },
                        type: 'ClusterIP',
                    },
                },
            },
        }

        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            attributes: {
                application_address: {
                    type: 'string',
                    default: {
                        eval: '.::cache_name',
                    },
                },
            },
            interfaces: {
                Standard: {
                    operations: {
                        create: {
                            implementation: {
                                ...AnsibleOrchestratorOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        AnsibleTouchManifestTask,
                                        AnsibleCreateManifestTak,
                                        {
                                            name: 'apply manifest',
                                            'ansible.builtin.shell': `${BASH_KUBECTL} apply -f {{ manifest.path }}`,
                                            args: {
                                                executable: '/usr/bin/bash',
                                            },
                                        },
                                        {
                                            name: 'wait for deployment',
                                            'ansible.builtin.shell': `${BASH_KUBECTL} rollout status deployment/{{ SELF.application_name }} --timeout 60s`,
                                            args: {
                                                executable: '/usr/bin/bash',
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                        delete: {
                            implementation: {
                                ...AnsibleOrchestratorOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        AnsibleTouchManifestTask,
                                        AnsibleCreateManifestTak,
                                        {
                                            name: 'unapply manifest',
                                            'ansible.builtin.shell': `${BASH_KUBECTL} delete -f {{ manifest.path }}`,
                                            args: {
                                                executable: '/usr/bin/bash',
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
