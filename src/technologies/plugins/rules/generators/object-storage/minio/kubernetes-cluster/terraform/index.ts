import {TerraformMinoBucketResources} from '#technologies/plugins/rules/generators/object-storage/minio/utils'
import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {TerraformStandardOperations} from '#technologies/plugins/rules/utils/terraform'
import {
    BASH_KUBECTL,
    KubernetesCredentials,
    MetadataGenerated,
    MetadataUnfurl,
} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'object.storage',
    technology: 'terraform',
    hosting: ['minio.server', 'kubernetes.cluster'],
    weight: 0.25,
    reason: 'Ansible is more specialized.',

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
                ...TerraformStandardOperations(),
                defaults: {
                    inputs: {
                        main: {
                            terraform: [],
                            provider: {},
                            resource: {
                                terraform_data: {
                                    forward_port: [
                                        {
                                            input: '127.0.0.1:{{ HOST.cache_port }}',
                                            provisioner: {
                                                'local-exec': {
                                                    command: [
                                                        `(nohup ${BASH_KUBECTL} port-forward service/{{ HOST.cache_name }} {{ HOST.cache_port }}:{{ HOST.cache_port }} > /dev/null 2>&1 &)`,
                                                        'sleep 5s',
                                                    ].join('\n'),
                                                    interpreter: ['/bin/bash', '-c'],
                                                },
                                            },
                                        },
                                    ],
                                    unforward_port: [
                                        {
                                            depends_on: ['minio_iam_policy.policy'],
                                            provisioner: {
                                                'local-exec': {
                                                    command: `pkill -f "port-forward service/{{ HOST.cache_name }}"`,
                                                    interpreter: ['/bin/bash', '-c'],
                                                },
                                            },
                                        },
                                    ],
                                },
                                ...TerraformMinoBucketResources(),
                            },
                        },
                    },
                },
            },
        }
    },
}

export default generator
