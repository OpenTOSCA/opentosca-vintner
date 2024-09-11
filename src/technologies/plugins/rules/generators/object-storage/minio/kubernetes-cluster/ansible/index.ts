import {
    AnsibleCreateBucketTasks,
    AnsibleDeleteBucketTasks,
} from '#technologies/plugins/rules/generators/object-storage/minio/utils'
import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {AnsibleOrchestratorOperation} from '#technologies/plugins/rules/utils/ansible'
import {
    BASH_KUBECTL,
    KubernetesCredentials,
    MetadataGenerated,
    MetadataUnfurl,
} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'object.storage',
    technology: 'ansible',
    hosting: ['minio.server', 'kubernetes.cluster'],
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
                ...KubernetesCredentials(),
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
                                            name: 'create bucket',
                                            block: [
                                                {
                                                    name: 'forward port',
                                                    'ansible.builtin.shell': `${BASH_KUBECTL} port-forward service/{{ HOST.cache_name }} {{ HOST.cache_port }}:{{ HOST.cache_port }}`,
                                                    args: {
                                                        executable: '/usr/bin/bash',
                                                    },
                                                    async: 30,
                                                    poll: 0,
                                                },
                                                ...AnsibleCreateBucketTasks(),
                                            ],
                                            always: [
                                                {
                                                    name: 'unforward port',
                                                    'ansible.builtin.shell':
                                                        'pkill -f "port-forward service/{{ HOST.cache_name }}"',
                                                    args: {
                                                        executable: '/usr/bin/bash',
                                                    },
                                                },
                                            ],
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
                                            name: 'delete bucket',
                                            block: [
                                                {
                                                    name: 'forward port',
                                                    'ansible.builtin.shell': `${BASH_KUBECTL} port-forward service/{{ HOST.cache_name }} {{ HOST.cache_port }}:{{ HOST.cache_port }}`,
                                                    args: {
                                                        executable: '/usr/bin/bash',
                                                    },
                                                    async: 30,
                                                    poll: 0,
                                                },
                                                ...AnsibleDeleteBucketTasks(),
                                            ],
                                            always: [
                                                {
                                                    name: 'unforward port',
                                                    'ansible.builtin.shell':
                                                        'pkill -f "port-forward service/{{ HOST.cache_name }}"',
                                                    args: {
                                                        executable: '/usr/bin/bash',
                                                    },
                                                },
                                            ],
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
