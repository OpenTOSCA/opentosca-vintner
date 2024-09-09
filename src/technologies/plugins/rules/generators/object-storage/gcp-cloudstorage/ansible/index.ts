import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {AnsibleOrchestratorOperation} from '#technologies/plugins/rules/utils/ansible'
import {GCPProviderCredentials, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'object.storage',
    technology: 'ansible',
    hosting: ['gcp.cloudstorage'],
    weight: 1,
    reason: 'Primary use case due to the specialization of Ansible.',

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
            attributes: {
                // TODO: connectivity
                bucket_endpoint: {
                    type: 'string',
                    default: '{{ SELF.bucket_name }}',
                },
                // TODO: auth
                bucket_token: {
                    type: 'string',
                    default: '',
                },
                bucket_dialect: {
                    type: 'string',
                    default: 'gcp',
                },
            },
            interfaces: {
                Standard: {
                    operations: {
                        create: {
                            implementation: {
                                ...AnsibleOrchestratorOperation(),
                                environment: {
                                    GCP_SERVICE_ACCOUNT_FILE: {
                                        eval: '.::gcp_service_account_file',
                                    },
                                    GCP_AUTH_KIND: 'serviceaccount',
                                },
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        // https://docs.ansible.com/ansible/latest/collections/google/cloud/gcp_storage_bucket_module.html#ansible-collections-google-cloud-gcp-storage-bucket-module
                                        {
                                            name: 'create bucket',
                                            'google.cloud.gcp_storage_bucket': {
                                                name: '{{ SELF.bucket_name }}',
                                                location: 'EU',
                                                project: '{{ SELF.gcp_project }}',
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                        delete: {
                            implementation: {
                                ...AnsibleOrchestratorOperation(),
                                environment: {
                                    GCP_SERVICE_ACCOUNT_FILE: {
                                        eval: '.::gcp_service_account_file',
                                    },
                                    GCP_AUTH_KIND: 'serviceaccount',
                                },
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        {
                                            name: 'delete bucket',
                                            'google.cloud.gcp_storage_bucket': {
                                                name: '{{ SELF.bucket_name }}',
                                                project: '{{ SELF.gcp_project }}',
                                                state: 'absent',
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
