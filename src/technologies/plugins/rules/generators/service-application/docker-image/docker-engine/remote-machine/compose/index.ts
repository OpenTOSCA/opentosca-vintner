import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleDockerHostEnvironment,
    AnsibleOrchestratorOperation,
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineHost,
    mapProperties,
} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    component: 'service.application',
    technology: 'compose',
    artifact: 'docker.image',
    hosting: ['docker.engine', 'remote.machine'],
    weight: 1,
    reason: 'Docker is the underlying technology.',
    details: 'docker compose manifest generated and applied',

    generate: (name, type) => {
        const AnsibleTouchComposeTask = {
            name: 'touch compose',
            register: 'compose',
            'ansible.builtin.tempfile': {
                suffix: '{{ SELF.application_name }}.compose.yaml',
            },
        }

        const AnsibleCreateComposeTask = {
            name: 'create compose',
            'ansible.builtin.copy': {
                dest: '{{ compose.path }}',
                content: '{{ manifest | to_yaml }}',
            },
            vars: {
                manifest: {
                    name: '{{ SELF.application_name }}',
                    services: {
                        application: {
                            container_name: '{{ SELF.application_name }}',
                            image: '{{ ".artifacts::docker_image::file" | eval }}',
                            network_mode: 'host',
                            environment: mapProperties(type, {format: 'map'}),
                        },
                    },
                },
            },
        }

        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {
                ...OpenstackMachineHost(),
            },
            attributes: {
                application_address: {
                    type: 'string',
                    default: '127.0.0.1',
                },
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
                                        AnsibleTouchComposeTask,
                                        AnsibleCreateComposeTask,
                                        {
                                            name: 'apply compose',
                                            'ansible.builtin.shell': 'docker compose -f {{ compose.path }} up -d',
                                            args: {
                                                executable: '/usr/bin/bash',
                                            },
                                            environment: {
                                                ...AnsibleDockerHostEnvironment(),
                                            },
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
                                        AnsibleTouchComposeTask,
                                        AnsibleCreateComposeTask,
                                        {
                                            name: 'apply compose',
                                            'ansible.builtin.shell': 'docker compose -f {{ compose.path }} down',
                                            args: {
                                                executable: '/usr/bin/bash',
                                            },
                                            environment: {
                                                ...AnsibleDockerHostEnvironment(),
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
