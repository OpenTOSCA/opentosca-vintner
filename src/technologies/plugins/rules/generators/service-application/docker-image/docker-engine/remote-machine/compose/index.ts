import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleHostOperation,
    AnsibleHostOperationPlaybookArgs,
    AnsibleWaitForSSHTask,
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
    mapProperties,
} from '#technologies/plugins/rules/utils'

// TODO: it must connect via DOCKER_HOST ssh and not via Ansible?!

const generator: ImplementationGenerator = {
    component: 'service.application',
    technology: 'compose',
    artifact: 'docker.image',
    hosting: ['docker.engine', 'remote.machine'],
    weight: 1,
    reason: 'Docker is the underlying technology.',
    details: 'docker compose manifest generated and applied',

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
                    default: '127.0.0.1',
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
                                        {
                                            name: 'touch compose',
                                            register: 'compose',
                                            'ansible.builtin.tempfile': {
                                                suffix: '{{ SELF.application_name }}.compose.yaml',
                                            },
                                        },
                                        {
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
                                        },
                                        {
                                            name: 'apply compose',
                                            'ansible.builtin.shell': 'docker compose -f {{ compose.path }} up -d',
                                            args: {
                                                executable: '/usr/bin/bash',
                                            },
                                        },
                                    ],
                                },
                                playbookArgs: [...AnsibleHostOperationPlaybookArgs()],
                            },
                        },
                        delete: 'exit 0',
                    },
                },
            },
        }
    },
}

export default generator
