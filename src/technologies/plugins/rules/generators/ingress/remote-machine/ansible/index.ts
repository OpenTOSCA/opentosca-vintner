import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleHostOperation,
    AnsibleHostOperationPlaybookArgs,
    AnsibleWaitForSSHTask,
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    component: 'ingress',
    technology: 'ansible',
    hosting: ['remote.machine'],
    weight: 1,
    reason: 'Primary use case due to the specialization of Ansible.',
    details:
        '"ansible.builtin.apt_key", "ansible.builtin.apt_repository", "ansible.builtin.apt", "ansible.builtin.copy", and "ansible.builtin.systemd" tasks',

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {...OpenstackMachineCredentials()},
            attributes: {
                // TODO: application address
                application_address: {
                    type: 'string',
                    default: {
                        eval: '.::.requirements::[.name=host]::.target::application_address',
                    },
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
                                            name: 'add apt key',
                                            'ansible.builtin.apt_key': {
                                                url: 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key',
                                                keyring: '/usr/share/keyrings/caddy-stable-archive-keyring.gpg',
                                                state: 'present',
                                            },
                                        },
                                        {
                                            name: 'add apt repository',
                                            'ansible.builtin.apt_repository': {
                                                repo: 'deb [signed-by=/usr/share/keyrings/caddy-stable-archive-keyring.gpg] https://dl.cloudsmith.io/public/caddy/stable/deb/debian any-version main',
                                                filename: 'caddy-stable',
                                                state: 'present',
                                            },
                                        },
                                        {
                                            name: 'install package',
                                            'ansible.builtin.apt': {
                                                name: 'caddy',
                                                state: 'present',
                                                update_cache: 'yes',
                                            },
                                        },
                                        {
                                            name: 'configure caddy',
                                            'ansible.builtin.copy': {
                                                dest: '/etc/caddy/Caddyfile',
                                                content:
                                                    ':80 {\n        reverse_proxy localhost:{{ SELF.application_port }}\n}\n',
                                            },
                                        },
                                        {
                                            name: 'restart caddy',
                                            'ansible.builtin.systemd': {
                                                name: 'caddy',
                                                state: 'reloaded',
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
