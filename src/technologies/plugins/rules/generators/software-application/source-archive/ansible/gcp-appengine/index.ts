import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleOrchestratorOperation,
    GCPProviderCredentials,
    MetadataGenerated,
    MetadataUnfurl,
    UnfurlArtifactFile,
    mapProperties,
} from '#technologies/plugins/rules/utils'

// TODO: application_address etc

const generator: ImplementationGenerator = {
    component: 'software.application',
    technology: 'ansible',
    artifact: 'source.archive',
    hosting: ['gcp.appengine'],

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {
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
                                            shell: 'gcloud app create --region {{ SELF.gcp_region }}',
                                            register: 'app_create_command',
                                            failed_when: [
                                                "'Created' not in app_create_command.stderr",
                                                "'already contains' not in app_create_command.stderr",
                                            ],
                                        },
                                        {
                                            name: 'create working directory',
                                            register: 'directory',
                                            tempfile: {
                                                state: 'directory',
                                            },
                                        },
                                        {
                                            name: 'extract deployment artifact in working directory',
                                            unarchive: {
                                                src: UnfurlArtifactFile('source_archive'),
                                                dest: '{{ directory.path }}',
                                            },
                                        },
                                        {
                                            name: 'touch specification',
                                            register: 'specification',
                                            'ansible.builtin.tempfile': {
                                                suffix: '{{ directory.path }}/app.yaml',
                                            },
                                        },

                                        // https://cloud.google.com/appengine/docs/standard/reference/app-yaml?tab=node.js
                                        {
                                            name: 'create manifest',
                                            'ansible.builtin.copy': {
                                                dest: '{{ specification.path }}',
                                                content: '{{ manifest | to_yaml }}',
                                            },
                                            vars: {
                                                manifest: {
                                                    runtime: '{{ SELF.application_language }}',
                                                    service: '{{ SELF.application_name }}',
                                                    instance_class: 'F1',
                                                    env_variables: mapProperties(type, {format: 'map'}),
                                                },
                                            },
                                        },

                                        // https://cloud.google.com/sdk/gcloud/reference/app/deploy
                                        {
                                            name: 'create app',
                                            shell: 'gcloud app deploy {{ tempdir_info.path }} --quiet',
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
                                        {
                                            name: 'activate service account',
                                            'ansible.builtin.shell':
                                                'gcloud auth activate-service-account --key-file {{ SELF.gcp_service_account_file }} --project {{ SELF.gcp_project }}',
                                        },

                                        // https://cloud.google.com/sdk/gcloud/reference/app/deploy
                                        {
                                            name: 'delete app',
                                            'ansible.builtin.shell':
                                                'gcloud app services delete {{ SELF.application_name }} --region {{ SELF.gcp_region }} --quiet',
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
