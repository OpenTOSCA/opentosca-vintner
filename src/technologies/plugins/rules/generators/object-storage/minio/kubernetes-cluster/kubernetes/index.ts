import {BashCreateBucket, BashDeleteBucket} from '#technologies/plugins/rules/generators/object-storage/minio/utils'
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
    technology: 'kubernetes',
    hosting: ['minio.server', 'kubernetes.cluster'],
    weight: 0,

    generate: (name, type) => {
        const job = '{{ SELF.storage_name }}-{{ HOST.cache_name }}'

        const AnsibleTouchJobTask = {
            name: 'touch manifest',
            register: 'manifest',
            'ansible.builtin.tempfile': {
                suffix: `${job}.object-storage.manifest.yaml`,
            },
        }

        const AnsibleCreateJobTask = (command: string) => {
            return {
                name: 'create manifest',
                'ansible.builtin.copy': {
                    dest: '{{ manifest.path }}',
                    content: '{{ job | to_yaml }}',
                },
                vars: {
                    job: {
                        apiVersion: 'batch/v1',
                        kind: 'Job',
                        metadata: {
                            name: job,
                        },
                        spec: {
                            template: {
                                spec: {
                                    restartPolicy: 'Never',
                                    containers: [
                                        {
                                            name: job,
                                            image: 'minio/mc:{{ ".artifacts::cache_image::file" | eval }}',
                                            command: ['/bin/bash', '-c', command],
                                        },
                                    ],
                                },
                            },
                        },
                    },
                },
            }
        }

        const AnsibleApplyJobTasks = [
            {
                name: 'apply manifest',
                'ansible.builtin.shell': `${BASH_KUBECTL} apply -f {{ manifest.path }}`,
                args: {
                    executable: '/usr/bin/bash',
                },
            },
            {
                name: 'wait for deployment',
                'ansible.builtin.shell': `${BASH_KUBECTL} wait --for=condition=complete --timeout=30s job/${job}`,
                args: {
                    executable: '/usr/bin/bash',
                },
            },

            {
                name: 'cleanup',
                'ansible.builtin.shell': `${BASH_KUBECTL} delete -f {{ manifest.path }}`,
                args: {
                    executable: '/usr/bin/bash',
                },
            },
        ]

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
                                        AnsibleTouchJobTask,
                                        AnsibleCreateJobTask(BashCreateBucket()),
                                        ...AnsibleApplyJobTasks,
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
                                        AnsibleTouchJobTask,
                                        AnsibleCreateJobTask(BashDeleteBucket()),
                                        ...AnsibleApplyJobTasks,
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
