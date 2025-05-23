import * as files from '#files'
import {ImplementationGenerator, PROPERTIES} from '#technologies/plugins/rules/types'
import {AnsibleOrchestratorOperation} from '#technologies/plugins/rules/utils/ansible'
import {
    ApplicationProperties,
    GCPProviderCredentials,
    JinjaSecureApplicationProtocol,
    MetadataGenerated,
    MetadataUnfurl,
    SecureApplicationProtocolPropertyDefinition,
    SourceArchiveFile,
} from '#technologies/plugins/rules/utils/utils'

const artifact = 'zip.archive'

const generator: ImplementationGenerator = {
    component: 'service.component',
    technology: 'ansible',
    artifact,
    hosting: ['gcp.appengine'],
    weight: 0,

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
                                        // https://cloud.google.com/sdk/gcloud/reference/app/create
                                        {
                                            name: 'enable GCP AppEngine',
                                            'ansible.builtin.shell':
                                                'gcloud app create --region {{ SELF.gcp_region }} --quiet',
                                            args: {
                                                executable: '/bin/bash',
                                            },
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
                                            'ansible.builtin.unarchive': {
                                                src: SourceArchiveFile(artifact),
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
                                                    env_variables: ApplicationProperties(type, {
                                                        ignore: [PROPERTIES.PORT],
                                                    }).toMap(),
                                                },
                                            },
                                        },

                                        // https://cloud.google.com/sdk/gcloud/reference/app/deploy
                                        {
                                            name: 'create app',
                                            'ansible.builtin.shell': 'gcloud app deploy {{ directory.path }} --quiet',
                                            args: {
                                                executable: '/bin/bash',
                                            },
                                        },

                                        // https://cloud.google.com/sdk/gcloud/reference/app/browse
                                        {
                                            name: 'browse app',
                                            register: 'browse_app',
                                            'ansible.builtin.shell':
                                                'gcloud app browse --service {{ SELF.application_name }} --no-launch-browser --quiet ',
                                            args: {
                                                executable: '/bin/bash',
                                            },
                                        },
                                        {
                                            name: 'set attributes',
                                            set_fact: {
                                                application_address: '{{ browse_app.stdout[8:] | trim }}',
                                                application_endpoint: `{{ ${JinjaSecureApplicationProtocol()} }}://{{ browse_app.stdout[8:] | trim }}:443`,
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
