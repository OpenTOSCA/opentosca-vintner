import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {AnsibleOrchestratorOperation} from '#technologies/plugins/rules/utils/ansible'
import {
    BASH_KUBECTL,
    KubernetesCredentials,
    MetadataGenerated,
    MetadataUnfurl,
} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'ingress',
    technology: 'kubernetes',
    hosting: ['kubernetes.cluster'],
    weight: 1,
    reason: 'Kubernetes is the underlying technology.',

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {...KubernetesCredentials()},
            attributes: {
                // TODO: application address
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
                                ...AnsibleOrchestratorOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        {
                                            name: 'touch manifest',
                                            register: 'manifest',
                                            'ansible.builtin.tempfile': {
                                                suffix: '{{ SELF.application_name }}.ingress.manifest.yaml',
                                            },
                                        },
                                        {
                                            name: 'create manifest',
                                            'ansible.builtin.copy': {
                                                dest: '{{ manifest.path }}',
                                                content: '{{ service | to_yaml }}',
                                            },
                                            vars: {
                                                service: {
                                                    apiVersion: 'v1',
                                                    kind: 'Service',
                                                    metadata: {
                                                        name: '{{ SELF.application_name }}-external',
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
                                                        type: 'LoadBalancer',
                                                    },
                                                },
                                            },
                                        },
                                        {
                                            name: 'apply manifest',
                                            'ansible.builtin.shell': `${BASH_KUBECTL} apply -f {{ manifest.path }}`,
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
