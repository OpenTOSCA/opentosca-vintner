import {BASH_HEADER} from '#technologies/plugins/rules/utils/utils'

export const BashIngressInstallationScript = `
${BASH_HEADER}

# Install caddy
apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/gpg.key | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update
apt-get install caddy -y

# Configure caddy
cat <<EOF > /etc/caddy/Caddyfile
:80 {
        reverse_proxy localhost:{{ SELF.application_port }}
}
EOF

# Restart caddy
systemctl reload caddy
`

export function AnsibleIngressCreateTasks() {
    return [
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
                content: ':80 {\n        reverse_proxy localhost:{{ SELF.application_port }}\n}\n',
            },
        },
        {
            name: 'restart caddy',
            'ansible.builtin.systemd': {
                name: 'caddy',
                state: 'reloaded',
            },
        },
    ]
}
