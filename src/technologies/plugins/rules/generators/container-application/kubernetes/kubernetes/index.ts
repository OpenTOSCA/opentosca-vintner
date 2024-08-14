import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {MetadataGenerated, MetadataUnfurl, mapProperties} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    id: 'container.application::kubernetes::kubernetes',
    generate: (name, type) => {
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
                                primary: 'Ansible',
                                operation_host: 'ORCHESTRATOR',
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        {
                                            name: 'touch manifest',
                                            register: 'manifest',
                                            'ansible.builtin.tempfile': {
                                                suffix: '{{ SELF.application_name }}.application.manifest.yaml',
                                            },
                                        },
                                        {
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
                                        },
                                        {
                                            name: 'apply manifest',
                                            'ansible.builtin.shell':
                                                'kubectl apply -f {{ manifest.path }}\nkubectl rollout status deployment/{{ SELF.application_name }} --timeout 60s\n',
                                            args: {
                                                executable: '/usr/bin/bash',
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
