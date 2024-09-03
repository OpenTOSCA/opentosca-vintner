import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleOrchestratorOperation,
    GCPProviderCredentials,
    MetadataGenerated,
    MetadataUnfurl,
} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    component: 'gcp.service',
    technology: 'ansible',
    hosting: [],
    weight: 1,
    reason: 'Ansible provides a declarative module',
    details: '"google.cloud.gcp_serviceusage_service" task',

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
                                    q: [
                                        {
                                            name: 'enable service',
                                            'google.cloud.gcp_serviceusage_service': {
                                                name: '{{ SELF.gcp_service }}',
                                                project: '{{ SELF.gcp_project }}',
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                        // We do not disable services
                        delete: 'exit 0',
                    },
                },
            },
        }
    },
}

export default generator
