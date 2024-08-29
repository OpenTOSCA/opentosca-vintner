import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
    OpenstackMachineHost,
    TerraformStandardOperations,
} from '#technologies/plugins/rules/utils'

const script = `
#!/usr/bin/env bash
set -e

# Install caddy
apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/gpg.key | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update
apt-get install caddy -y

# Configure caddy
echo > /etc/caddy/Caddyfile
echo ":80 {" >> /etc/caddy/Caddyfile
echo "        reverse_proxy localhost:{{ SELF.application_port }}" >> /etc/caddy/Caddyfile
echo "}" >> /etc/caddy/Caddyfile

# Restart caddy
systemctl reload caddy
`

const generator: ImplementationGenerator = {
    component: 'ingress',
    technology: 'terraform',
    hosting: ['virtual.machine'],
    weight: 0,
    reason: 'Ansible is more specialized. Also using Remote-Exec Executor is a "last resort".',
    details:
        '"terraform_data" resource with an "ssh" connection to the virtual machine to copy the install script using the "file" provisioner on the virtual machine and to execute the script using the "remote-exec" provisioner',

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {...OpenstackMachineCredentials(), ...OpenstackMachineHost()},
            attributes: {
                // TODO: implement this
                application_address: {
                    type: 'string',
                    default: {eval: '.::.requirements::[.name=host]::.target::application_address'},
                },
            },

            interfaces: {
                ...TerraformStandardOperations(),
                defaults: {
                    inputs: {
                        main: {
                            resource: {
                                terraform_data: {
                                    vm: [
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
                                                        content: script,
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
