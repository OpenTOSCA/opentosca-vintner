import {ImplementationGenerator} from '#technologies/plugins/rules/implementation/types'
import {generatedMetadata} from '#technologies/plugins/rules/implementation/utils'

const plugin: ImplementationGenerator = {
    id: 'gcp.service::ansible',
    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {...generatedMetadata()},
            properties: {
                gcp_service_account_file: {
                    type: 'string',
                    default: {
                        get_input: 'gcp_service_account_file',
                    },
                },
                gcp_region: {
                    type: 'string',
                    default: {
                        get_input: 'gcp_region',
                    },
                },
                gcp_project: {
                    type: 'string',
                    default: {
                        get_input: 'gcp_project',
                    },
                },
            },
            interfaces: {
                Standard: {
                    operations: {
                        create: {
                            implementation: {
                                primary: 'Ansible',
                                operation_host: 'HOST',
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

export default plugin
