import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {AnsibleOrchestratorOperation} from '#technologies/plugins/rules/utils/ansible'
import {GCPProviderCredentials, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

// TODO: next: implement this, see https://docs.ansible.com/ansible/latest/collections/google/cloud/gcp_storage_object_module.html

const generator: ImplementationGenerator = {
    component: 'bucket',
    technology: 'ansible',
    hosting: ['gcp.cloudstorage'],
    // TODO: which weight? most likely 1
    weight: 0.5,
    reason: 'Primary use case due to the specialization of Ansible. However, need to install and handle GCP CloudSQL Proxy, while the corresponding Terraform module already provides this.',

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
                                environment: {
                                    GCP_SERVICE_ACCOUNT_FILE: {
                                        eval: '.::gcp_service_account_file',
                                    },
                                    GCP_AUTH_KIND: 'serviceaccount',
                                },
                            },
                            inputs: {
                                playbook: {
                                    q: [],
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
                                    q: [],
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
