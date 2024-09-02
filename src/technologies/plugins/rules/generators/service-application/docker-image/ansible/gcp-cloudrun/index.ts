import * as files from '#files'
import {ImplementationGenerator, PROPERTIES} from '#technologies/plugins/rules/types'
import {
    AnsibleOrchestratorOperation,
    GCPProviderCredentials,
    JinjaSecureApplicationProtocol,
    MetadataGenerated,
    MetadataUnfurl,
    SecureApplicationProtocolPropertyDefinition,
    mapProperties,
} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    component: 'service.application',
    technology: 'ansible',
    artifact: 'docker.image',
    hosting: ['gcp.cloudrun'],
    weight: 0,
    reason: 'Custom module with imperative parts, while Terraform provides a declarative module.',
    details: '"ansible.builtin.shell", "ansible.builtin.tempfile", and "ansible.builtin.copy" tasks ',

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {
                ...SecureApplicationProtocolPropertyDefinition(type),
                ...GCPProviderCredentials(),
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
                                            name: 'activate service account',
                                            'ansible.builtin.shell':
                                                'gcloud auth activate-service-account --key-file {{ SELF.gcp_service_account_file }} --project {{ SELF.gcp_project }}',
                                            args: {
                                                executable: '/bin/bash',
                                            },
                                        },
                                        {
                                            name: 'touch service',
                                            register: 'service',
                                            'ansible.builtin.tempfile': {
                                                suffix: '{{ SELF.application_name }}.service.yaml',
                                            },
                                        },
                                        // https://cloud.google.com/run/docs/reference/yaml/v1
                                        {
                                            name: 'create service',
                                            'ansible.builtin.copy': {
                                                dest: '{{ service.path }}',
                                                content: '{{ manifest | to_yaml }}',
                                            },
                                            vars: {
                                                manifest: {
                                                    apiVersion: 'serving.knative.dev/v1',
                                                    kind: 'Service',
                                                    metadata: {
                                                        name: '{{ SELF.application_name }}',
                                                        labels: {
                                                            'cloud.googleapis.com/location': '{{ SELF.gcp_region }}',
                                                        },
                                                        annotations: {
                                                            'run.googleapis.com/ingress': 'all',
                                                        },
                                                    },
                                                    spec: {
                                                        template: {
                                                            spec: {
                                                                containers: [
                                                                    {
                                                                        image: '{{ ".artifacts::docker_image::file" | eval }}',
                                                                        ports: [
                                                                            {
                                                                                name: 'http1',
                                                                                containerPort:
                                                                                    '{{ SELF.application_port }}',
                                                                            },
                                                                        ],
                                                                        env: mapProperties(type, {
                                                                            ignore: [PROPERTIES.PORT],
                                                                        }),
                                                                    },
                                                                ],
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                        // https://cloud.google.com/sdk/gcloud/reference/run/services/replace
                                        {
                                            name: 'apply service',
                                            'ansible.builtin.shell':
                                                'gcloud run services replace {{ service.path }} --quiet',
                                            args: {
                                                executable: '/bin/bash',
                                            },
                                        },
                                        {
                                            name: 'touch policy',
                                            register: 'policy',
                                            'ansible.builtin.tempfile': {
                                                suffix: '{{ SELF.application_name }}.policy.yaml',
                                            },
                                        },
                                        // https://cloud.google.com/run/docs/authenticating/public
                                        {
                                            name: 'fill policy',
                                            'ansible.builtin.copy': {
                                                dest: '{{ policy.path }}',
                                                content: '{{ manifest | to_yaml }}',
                                            },
                                            vars: {
                                                manifest: {
                                                    bindings: [
                                                        {
                                                            members: ['allUsers'],
                                                            role: 'roles/run.invoker',
                                                        },
                                                    ],
                                                },
                                            },
                                        },
                                        {
                                            name: 'apply policy',
                                            'ansible.builtin.shell':
                                                'gcloud run services set-iam-policy {{ SELF.application_name }} {{ policy.path }} --region {{ SELF.gcp_region }} --quiet',
                                            args: {
                                                executable: '/bin/bash',
                                            },
                                        },
                                        // https://cloud.google.com/sdk/gcloud/reference/run/services/describe
                                        {
                                            name: 'describe service',
                                            register: 'service_description',
                                            'ansible.builtin.shell':
                                                'gcloud run services describe {{ SELF.application_name }} --region {{ SELF.gcp_region }} --quiet --format=json',
                                            args: {
                                                executable: '/bin/bash',
                                            },
                                        },
                                        {
                                            name: 'set attributes',
                                            set_fact: {
                                                application_address:
                                                    '{{ (service_description.stdout | from_json ).status.url[8:] | trim }}',
                                                application_endpoint: `{{ ${JinjaSecureApplicationProtocol()} }}://{{ (service_description.stdout | from_json ).status.url[8:] | trim }}:443`,
                                            },
                                        },
                                    ],
                                },
                                resultTemplate: files.toYAML({
                                    name: 'SELF',
                                    attributes: {
                                        application_address: '{{ outputs.application_address | trim }}',
                                        application_endpoint: '{{ outputs.application_endpoint | trim }}',
                                    },
                                }),
                            },
                            outputs: {
                                application_address: null,
                                application_endpoint: null,
                            },
                        },
                        delete: {
                            implementation: {
                                ...AnsibleOrchestratorOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        {
                                            name: 'activate service account',
                                            'ansible.builtin.shell':
                                                'gcloud auth activate-service-account --key-file {{ SELF.gcp_service_account_file }} --project {{ SELF.gcp_project }}',
                                            args: {
                                                executable: '/bin/bash',
                                            },
                                        },
                                        // https://cloud.google.com/sdk/gcloud/reference/run/services/delete
                                        {
                                            name: 'delete app',
                                            'ansible.builtin.shell':
                                                'gcloud run services delete {{ SELF.application_name }} --region {{ SELF.gcp_region }} --quiet',
                                            args: {
                                                executable: '/bin/bash',
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
