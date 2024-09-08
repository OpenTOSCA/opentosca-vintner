import * as files from '#files'

export function DockerEngineServiceUnit() {
    return files.toINI({
        Unit: {
            Description: 'Docker Application Container Engine',
            Documentation: 'https://docs.docker.com',
            After: 'network-online.target docker.socket firewalld.service containerd.service time-set.target',
            Wants: 'network-online.target containerd.service',
            Requires: 'docker.socket',
        },
        Service: {
            Type: 'notify',
            ExecStart: '/usr/bin/dockerd -H fd:// -H tcp://0.0.0.0:2375 --containerd=/run/containerd/containerd.sock',
            ExecReload: '/bin/kill -s HUP $MAINPID',
            TimeoutStartSec: '0',
            RestartSec: '2',
            Restart: 'always',
            StartLimitBurst: '3',
            StartLimitInterval: '60s',
            LimitNPROC: 'infinity',
            LimitCORE: 'infinity',
            TasksMax: 'infinity',
            Delegate: 'yes',
            KillMode: 'process',
            OOMScoreAdjust: '-500',
        },
        Install: {
            WantedBy: 'multi-user.target',
        },
    })
}

export function AnsibleDockerEngineInstallationTasks() {
    return [
        {
            name: 'install docker',
            'ansible.builtin.shell': 'curl -sSL https://get.docker.com | sh',
            args: {
                executable: '/usr/bin/bash',
            },
        },
        {
            name: 'update service',
            'ansible.builtin.copy': {
                dest: '/lib/systemd/system/docker.service',
                content: DockerEngineServiceUnit(),
            },
        },
        {
            name: 'restart service',
            'ansible.builtin.systemd': {
                name: 'docker.service',
                state: 'restarted',
                enabled: 'yes',
                daemon_reload: 'yes',
            },
        },
        {
            name: 'add docker group',
            'ansible.builtin.group': {
                name: 'docker',
            },
        },
        {
            name: 'add user to docker group',
            'ansible.builtin.user': {
                name: '{{ SELF.os_ssh_user }}',
                groups: 'docker',
                append: 'yes',
            },
        },
    ]
}

/**
 * https://docs.docker.com/engine/install/ubuntu/#uninstall-docker-engine
 */
export function AnsibleDockerEngineUninstallationTasks() {
    return [
        {
            name: 'delete docker packages',
            'ansible.builtin.apt': {
                name: [
                    'docker-ce',
                    'docker-ce-cli',
                    'containerd.io',
                    'docker-buildx-plugin',
                    'docker-compose-plugin',
                    'docker-ce-rootless-extras',
                ],
                state: 'absent',
                purge: 'true',
                autoremove: 'true',
            },
        },
        {
            name: 'delete docker directories',
            'ansible.builtin.file': {
                name: '{{ item }}',
                state: 'absent',
            },
            loop: ['/var/lib/docker', '/var/lib/containerd'],
        },
    ]
}

export function TerraformDockerEngineInstallationTasks() {
    return [
        'curl -sSL https://get.docker.com | sudo sh',
        'sudo groupadd -f docker',
        'sudo usermod -aG docker {{ SELF.os_ssh_user }}',
        'sleep 10s',
        'cat /tmp/docker.service | sudo tee /lib/systemd/system/docker.service',
        'sudo systemctl daemon-reload',
        'sudo systemctl restart docker.service',
    ]
}

export function TerraformDockerEngineUninstallationTasks() {
    return [
        'sudo apt-get purge docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin docker-ce-rootless-extras -y',
        'sudo rm -rf /var/lib/docker',
        'sudo rm -rf /var/lib/containerd',
    ]
}
