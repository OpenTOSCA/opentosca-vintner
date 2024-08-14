import {ImplementationGenerator, PROPERTIES} from '#technologies/plugins/rules/types'
import {
    GCPProviderCredentials,
    MetadataGenerated,
    MetadataUnfurl,
    SecureApplicationProtocolPropertyDefinition,
    mapProperties,
} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    id: 'container.application::ansible::gcp.cloudrun',
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
                                primary: 'Ansible',
                                operation_host: 'ORCHESTRATOR',
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        {
                                            name: 'activate service account',
                                            'ansible.builtin.shell':
                                                'gcloud auth activate-service-account --key-file {{ SELF.gcp_service_account_file }} --project {{ SELF.gcp_project }}',
                                        },
                                        {
                                            name: 'touch service',
                                            register: 'service',
                                            'ansible.builtin.tempfile': {
                                                suffix: '{{ SELF.application_name }}.service.yaml',
                                            },
                                        },
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
                                                                        image: '{{ SELF.application_image }}',
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
                                        {
                                            name: 'apply service',
                                            'ansible.builtin.shell':
                                                'gcloud run services replace {{ service.path }} --quiet',
                                        },
                                        {
                                            name: 'touch policy',
                                            register: 'policy',
                                            'ansible.builtin.tempfile': {
                                                suffix: '{{ SELF.application_name }}.policy.yaml',
                                            },
                                        },
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
                                        },
                                        {
                                            name: 'describe service',
                                            register: 'service_description',
                                            'ansible.builtin.shell':
                                                'gcloud run services describe {{ SELF.application_name }} --region {{ SELF.gcp_region }} --quiet --format=json',
                                        },
                                        {
                                            name: 'set attributes',
                                            set_fact: {
                                                application_address:
                                                    '{{ (service_description.stdout | from_json ).status.url[8:] | trim }}',
                                                application_endpoint:
                                                    '{{ SELF.application_protocol }}://{{ (service_description.stdout | from_json ).status.url[8:] | trim }}:443',
                                            },
                                        },
                                    ],
                                },
                                resultTemplate:
                                    '- name: SELF\n  attributes:\n    application_address: "{{ outputs.application_address }}"\n    application_endpoint: "{{ outputs.application_endpoint }}"\n',
                            },
                            outputs: {
                                application_address: null,
                                application_endpoint: null,
                            },
                        },
                        delete: {
                            implementation: {
                                primary: 'Ansible',
                                operation_host: 'ORCHESTRATOR',
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        {
                                            name: 'activate service account',
                                            'ansible.builtin.shell':
                                                'gcloud auth activate-service-account --key-file {{ SELF.gcp_service_account_file }} --project {{ SELF.gcp_project }}',
                                        },
                                        {
                                            name: 'create app',
                                            'ansible.builtin.shell':
                                                'gcloud run services delete {{ SELF.application_name }} --region {{ SELF.gcp_region }} --quiet',
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
