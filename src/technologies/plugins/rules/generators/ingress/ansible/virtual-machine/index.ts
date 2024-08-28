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
    hosting: ['virtual.machine'],
    weight: 1,
    reasoning: 'Primary use case due to the specialization of Ansible.',

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {...OpenstackMachineCredentials()},
            attributes: {
                // TODO: implement this
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
                                        // TODO: improve this
                                        {
                                            name: 'install caddy',
                                            'ansible.builtin.shell':
                                                "apt install -y debian-keyring debian-archive-keyring apt-transport-https curl\ncurl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg\ncurl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list\napt-get update\napt-get install caddy -y\n",
                                            args: {
                                                executable: '/usr/bin/bash',
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
