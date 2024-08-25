import * as files from '#files'
import {ImplementationGenerator, PROPERTIES} from '#technologies/plugins/rules/types'
import {
    AnsibleOrchestratorOperation,
    GCPProviderCredentials,
    MetadataGenerated,
    MetadataUnfurl,
    SecureApplicationProtocolPropertyDefinition,
    ZipArchiveFile,
    mapProperties,
} from '#technologies/plugins/rules/utils'

// TODO: port is now 443

const generator: ImplementationGenerator = {
    component: 'service.application',
    technology: 'ansible',
    artifact: 'zip.archive',
    hosting: ['gcp.appengine'],
    weight: 0,
    comment: 'Custom module with imperative parts, while Terraform provides a declarative module.',

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {
                // TODO: this is not added
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
                                            shell: 'gcloud auth activate-service-account --key-file {{ SELF.gcp_service_account_file }} --project {{ SELF.gcp_project }}',
                                        },
                                        // https://cloud.google.com/sdk/gcloud/reference/app/create
                                        {
                                            name: 'enable GCP AppEngine',
                                            shell: 'gcloud app create --region {{ SELF.gcp_region }} --quiet',
                                            register: 'app_create_command',
                                            failed_when: [
                                                "'Created' not in app_create_command.stderr",
                                                "'already contains' not in app_create_command.stderr",
                                            ],
                                        },
                                        {
                                            name: 'create working directory',
                                            register: 'directory',
                                            'ansible.builtin.tempfile': {
                                                state: 'directory',
                                            },
                                        },
                                        {
                                            name: 'extract deployment artifact in working directory',
                                            unarchive: {
                                                src: ZipArchiveFile(),
                                                dest: '{{ directory.path }}',
                                            },
                                        },
                                        // https://cloud.google.com/appengine/docs/standard/reference/app-yaml?tab=node.js
                                        {
                                            name: 'create specification',
                                            'ansible.builtin.copy': {
                                                dest: '{{ directory.path }}/app.yaml',
                                                content: '{{ manifest | to_yaml }}',
                                            },
                                            vars: {
                                                manifest: {
                                                    runtime: '{{ SELF.application_language }}',
                                                    service: '{{ SELF.application_name }}',
                                                    instance_class: 'F1',
                                                    env_variables: mapProperties(type, {
                                                        format: 'map',
                                                        ignore: [PROPERTIES.PORT],
                                                    }),
                                                },
                                            },
                                        },

                                        // https://cloud.google.com/sdk/gcloud/reference/app/deploy
                                        {
                                            name: 'create app',
                                            shell: 'gcloud app deploy {{ directory.path }} --quiet',
                                        },

                                        // https://cloud.google.com/sdk/gcloud/reference/app/browse
                                        {
                                            name: 'browse app',
                                            register: 'browse_app',
                                            shell: 'gcloud app browse --service {{ SELF.application_name }} --no-launch-browser --quiet ',
                                        },
                                        {
                                            name: 'set attributes',
                                            set_fact: {
                                                application_address: '{{ browse_app.stdout[8:] | trim }}',
                                                application_endpoint:
                                                    '{{ SELF.application_protocol }}://{{ browse_app.stdout[8:] | trim }}:443',
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

                                        // https://cloud.google.com/sdk/gcloud/reference/app/deploy
                                        {
                                            name: 'delete app',
                                            'ansible.builtin.shell':
                                                'gcloud app services delete {{ SELF.application_name }} --quiet',
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
