import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {AnsibleOrchestratorOperation} from '#technologies/plugins/rules/utils/ansible'
import {GCPProviderCredentials, MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

// TODO: connectivity

const generator: ImplementationGenerator = {
    component: 'redis.server',
    technology: 'ansible',
    artifact: 'cache.image',
    hosting: ['gcp.memorystore'],
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
                                        // https://docs.ansible.com/ansible/latest/collections/google/cloud/gcp_redis_instance_module.html
                                        {
                                            name: 'create redis',
                                            'google.cloud.gcp_redis_instance': {
                                                name: '{{ SELF.cache_name }}',
                                                memory_size_gb: 1,
                                                region: '{{ SELF.gcp_region }}',
                                                project: '{{ SELF.gcp_project }}',
                                            },
                                            register: 'redis_info',
                                        },
                                        {
                                            name: 'set attributes',
                                            set_fact: {
                                                application_endpoint: '{{ redis_info.host }}:{{ redis_info.port }}',
                                                application_address: '{{ redis_info.host }}',
                                                application_port: '{{ redis_info.port }}',
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
                                            name: 'delete redis',
                                            'google.cloud.gcp_redis_instance': {
                                                name: '{{ SELF.cache_name }}',
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
