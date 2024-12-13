import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {AnsibleGCPCredentialsEnvironment, AnsibleOrchestratorOperation} from '#technologies/plugins/rules/utils/ansible'
import {GCPProviderCredentials, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'gcp.service',
    technology: 'ansible',
    hosting: [],
    weight: 0,

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
                                    ...AnsibleGCPCredentialsEnvironment(),
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
                        // We do not disable gcp services
                        delete: 'exit 0',
                    },
                },
            },
        }
    },
}

export default generator
