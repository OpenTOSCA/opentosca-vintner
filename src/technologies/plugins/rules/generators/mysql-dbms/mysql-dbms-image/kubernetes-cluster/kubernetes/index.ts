import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleOrchestratorOperation,
    KubernetesCredentials,
    MetadataGenerated,
    MetadataUnfurl,
} from '#technologies/plugins/rules/utils'

// TODO: does not use k8s auth

const generator: ImplementationGenerator = {
    component: 'mysql.dbms',
    technology: 'kubernetes',
    artifact: 'dbms.image',
    hosting: ['kubernetes.cluster'],
    weight: 1,
    reason: 'Kubernetes is the underlying technology.',
    details: 'Kubernetes manifest generated and applied',

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
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        {
                                            name: 'touch manifest',
                                            register: 'manifest',
                                            'ansible.builtin.tempfile': {
                                                suffix: '{{ SELF.dbms_name }}.dbms.manifest.yaml',
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
                                                service: {
                                                    apiVersion: 'v1',
                                                    kind: 'Service',
                                                    metadata: {
                                                        name: '{{ SELF.dbms_name }}',
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
                                        {
                                            name: 'apply manifest',
                                            'ansible.builtin.shell': 'kubectl apply -f {{ manifest.path }}',
                                            args: {
                                                executable: '/usr/bin/bash',
                                            },
                                        },
                                        {
                                            name: 'wait for deployment',
                                            'ansible.builtin.shell':
                                                'kubectl rollout status deployment/{{ SELF.dbms_name }} --timeout 60s',
                                            args: {
                                                executable: '/usr/bin/bash',
                                            },
                                        },
                                        {
                                            name: 'give DBMS some time',
                                            'ansible.builtin.pause': {
                                                seconds: 10,
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
