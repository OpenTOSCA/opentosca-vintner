import {ImplementationGenerator} from '#technologies/plugins/rules/implementation/types'
import {MetadataGenerated, OpenstackMachineCredentials} from '#technologies/plugins/rules/implementation/utils'

const generator: ImplementationGenerator = {
    id: 'ingress::terraform::openstack.machine',
    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {...MetadataGenerated()},
            properties: {
                ...OpenstackMachineCredentials(),
                os_ssh_host: {
                    type: 'string',
                    default: {
                        eval: '.::.requirements::[.name=host]::.target::management_address',
                    },
                },
            },
            attributes: {
                // TODO: implement this
                application_address: {
                    type: 'string',
                    default: {eval: '.::.requirements::[.name=host]::.target::application_address'},
                },
            },

            interfaces: {
                Standard: {
                    operations: {
                        configure: {
                            implementation: {
                                primary: 'Terraform',
                            },
                        },
                    },
                },
                defaults: {
                    inputs: {
                        main: {
                            resource: {
                                terraform_data: {
                                    os: [
                                        {
                                            connection: [
                                                {
                                                    host: '{{ SELF.os_ssh_host }}',
                                                    private_key: '${file("{{ SELF.os_ssh_key_file }}")}',
                                                    type: 'ssh',
                                                    user: '{{ SELF.os_ssh_user }}',
                                                },
                                            ],
                                            provisioner: {
                                                file: [
                                                    {
                                                        content:
                                                            'apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl\ncurl -1sLf \'https://dl.cloudsmith.io/public/caddy/stable/gpg.key\' | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg\ncurl -1sLf \'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt\' | tee /etc/apt/sources.list.d/caddy-stable.list\napt-get update\napt-get install caddy -y\n\necho > /etc/caddy/Caddyfile\necho ":80 {" >> /etc/caddy/Caddyfile\necho "        reverse_proxy localhost:{{ SELF.application_port }}" >> /etc/caddy/Caddyfile\necho "}" >> /etc/caddy/Caddyfile\n\nsystemctl reload caddy\n',
                                                        destination: '/tmp/install-ingress.sh',
                                                    },
                                                ],
                                                'remote-exec': [
                                                    {
                                                        inline: ['sudo bash /tmp/install-ingress.sh'],
                                                    },
                                                ],
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
