import {BashCreateBucket, BashDeleteBucket} from '#technologies/plugins/rules/generators/object-storage/minio/utils'
import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleApplyComposeTasks,
    AnsibleOrchestratorOperation,
    AnsibleUnapplyComposeTasks,
} from '#technologies/plugins/rules/utils/ansible'
import {
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
    OpenstackMachineHost,
} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'object.storage',
    technology: 'compose',
    hosting: ['minio.server', 'docker.engine', 'remote.machine'],
    weight: 0,
    reason: 'One-time use docker container ("fake Kubernetes job") with imperative parts, while other technologies provide declarative modules.',

    generate: (name, type) => {
        const job = '{{ SELF.storage_name }}-{{ HOST.cache_name }}'
        const remote = true

        const AnsibleTouchJobTask = {
            name: 'touch compose',
            register: 'compose',
            'ansible.builtin.tempfile': {
                suffix: `${job}.database.compose.yaml`,
            },
        }

        const AnsibleCreateJobTask = (command: string) => {
            return {
                name: 'create compose',
                'ansible.builtin.copy': {
                    dest: '{{ compose.path }}',
                    content: '{{ manifest | to_yaml }}',
                },
                vars: {
                    manifest: {
                        name: job,
                        services: {
                            job: {
                                container_name: job,
                                // TODO: the image tags do not match
                                image: 'minio/mc:{{ ".artifacts::cache_image::file" | eval }}',
                                network_mode: 'host',
                                command: ['/bin/bash', '-c', command],
                            },
                        },
                    },
                },
            }
        }

        const AnsibleApplyJobTasks = [
            ...AnsibleApplyComposeTasks({remote}),
            {
                name: 'let it cook',
                'ansible.builtin.pause': {
                    seconds: 10,
                },
            },
            ...AnsibleUnapplyComposeTasks({remote}),
        ]

        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {
                ...OpenstackMachineHost(),
                ...OpenstackMachineCredentials(),
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
