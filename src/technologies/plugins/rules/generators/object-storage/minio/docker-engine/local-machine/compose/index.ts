import {BashCreateBucket, BashDeleteBucket} from '#technologies/plugins/rules/generators/object-storage/minio/utils'
import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleApplyComposeTasks,
    AnsibleCreateComposeTask,
    AnsibleOrchestratorOperation,
    AnsibleTouchComposeTask,
    AnsibleUnapplyComposeTasks,
} from '#technologies/plugins/rules/utils/ansible'
import {MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'object.storage',
    technology: 'compose',
    hosting: ['minio.server', 'docker.engine', 'local.machine'],
    weight: 0,

    generate: (name, type) => {
        const Operation = (command: string) => {
            const job = '{{ SELF.storage_name }}-{{ HOST.cache_name }}'

            return {
                implementation: {
                    ...AnsibleOrchestratorOperation(),
                },
                inputs: {
                    playbook: {
                        q: [
                            {
                                ...AnsibleTouchComposeTask({
                                    suffix: `${job}.database.compose.yaml`,
                                }),
                            },
                            {
                                ...AnsibleCreateComposeTask({
                                    manifest: {
                                        name: job,
                                        services: {
                                            job: {
                                                container_name: job,
                                                image: 'minio/mc:{{ ".artifacts::cache_image::file" | eval }}',
                                                network_mode: 'host',
                                                command: ['/bin/bash', '-c', command],
                                            },
                                        },
                                    },
                                }),
                            },
                            ...AnsibleApplyComposeTasks(),
                            {
                                name: 'let it cook',
                                'ansible.builtin.pause': {
                                    seconds: 10,
                                },
                            },
                            ...AnsibleUnapplyComposeTasks(),
                        ],
                    },
                },
            }
        }

        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            interfaces: {
                Standard: {
                    operations: {
                        create: Operation(BashCreateBucket()),
                        delete: Operation(BashDeleteBucket()),
                    },
                },
            },
        }
    },
}

export default generator
