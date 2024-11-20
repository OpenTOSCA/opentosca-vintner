import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleDockerContainerTask,
    AnsibleHostOperation,
    AnsibleHostOperationPlaybookArgs,
    AnsibleWaitForSSHTask,
} from '#technologies/plugins/rules/utils/ansible'
import {
    ApplicationProperties,
    LOCALHOST,
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'redis.server',
    technology: 'ansible',
    artifact: 'cache.image',
    hosting: ['docker.engine', 'remote.machine'],
    weight: 0.5,
    reason: 'Docker Compose is more specialized.',

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {...OpenstackMachineCredentials()},
            attributes: {
                application_address: {
                    type: 'string',
                    default: LOCALHOST,
                },
            },
            interfaces: {
                Standard: {
                    operations: {
                        create: {
                            implementation: {
                                ...AnsibleHostOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        {
                                            ...AnsibleWaitForSSHTask(),
                                        },
                                        // https://hub.docker.com/_/redis
                                        {
                                            ...AnsibleDockerContainerTask({
                                                name: 'start container',
                                                container: {
                                                    name: '{{ SELF.cache_name }}',
                                                    image: 'redis:{{ ".artifacts::cache_image::file" | eval }}',
                                                    network_mode: 'host',
                                                    command: 'redis --port {{ SELF.application_port }}',
                                                    env: ApplicationProperties(type).toMap(),
                                                },
                                            }),
                                        },
                                    ],
                                },
                                playbookArgs: [...AnsibleHostOperationPlaybookArgs()],
                            },
                        },
                        delete: {
                            implementation: {
                                ...AnsibleHostOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        {
                                            ...AnsibleWaitForSSHTask(),
                                        },
                                        {
                                            ...AnsibleDockerContainerTask({
                                                name: 'stop container',
                                                container: {
                                                    name: '{{ SELF.cache_name }}',
                                                    state: 'absent',
                                                },
                                            }),
                                        },
                                    ],
                                },
                                playbookArgs: [...AnsibleHostOperationPlaybookArgs()],
                            },
                        },
                    },
                },
            },
        }
    },
}

export default generator
