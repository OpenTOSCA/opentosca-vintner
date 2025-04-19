import {
    AnsibleCreateBucketTasks,
    AnsibleDeleteBucketTasks,
} from '#technologies/plugins/rules/generators/object-storage/minio/utils'
import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {AnsibleOrchestratorOperation} from '#technologies/plugins/rules/utils/ansible'
import {MetadataGenerated, MetadataUnfurl} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'object.storage',
    technology: 'ansible',
    hosting: ['minio.server', 'docker.engine', 'local.machine'],
    weight: 1,
    reason: 'The object storage is hosted on a MinIO server on a Docker engine on a local machine. Ansible and Terraform offer declarative modules for this scenario.',

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
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
                                    q: AnsibleCreateBucketTasks(),
                                },
                            },
                        },
                        delete: {
                            implementation: {
                                ...AnsibleOrchestratorOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: AnsibleDeleteBucketTasks(),
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
