import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {AnsibleOrchestratorOperation} from '#technologies/plugins/rules/utils/ansible'
import {
    ApplicationProperties,
    BASH_KUBECTL,
    MetadataGenerated,
    MetadataUnfurl,
} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'service.application',
    technology: 'kubernetes',
    artifact: 'docker.image',
    hosting: ['kubernetes.cluster'],
    weight: 1,
    reason: 'Kubernetes is the underlying technology.',
    details: 'Kubernetes manifest generated and applied',

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
                                                containerPort: '{{ SELF.application_port }}',
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
