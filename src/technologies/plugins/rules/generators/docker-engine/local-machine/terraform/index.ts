import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {MetadataGenerated, MetadataUnfurl, TerraformStandardOperations} from '#technologies/plugins/rules/utils'
import * as utils from '#utils'

// TODO: maybe dont install but only check if installed?
const service = utils.trim(`
[Unit]
Description=Docker Application Container Engine
Documentation=https://docs.docker.com
After=network-online.target docker.socket firewalld.service containerd.service time-set.target
Wants=network-online.target containerd.service
Requires=docker.socket

[Service]
Type=notify
# the default is not to use systemd for cgroups because the delegate issues still
# exists and systemd currently does not support the cgroup feature set required
# for containers run by docker
ExecStart=/usr/bin/dockerd -H fd:// -H tcp://0.0.0.0:2375 --containerd=/run/containerd/containerd.sock
ExecReload=/bin/kill -s HUP $MAINPID
TimeoutStartSec=0
RestartSec=2
Restart=always

# Note that StartLimit* options were moved from "Service" to "Unit" in systemd 229.
# Both the old, and new location are accepted by systemd 229 and up, so using the old location
# to make them work for either version of systemd.
StartLimitBurst=3

# Note that StartLimitInterval was renamed to StartLimitIntervalSec in systemd 230.
# Both the old, and new name are accepted by systemd 230 and up, so using the old name to make
# this option work for either version of systemd.
StartLimitInterval=60s

# Having non-zero Limit*s causes performance problems due to accounting overhead
# in the kernel. We recommend using cgroups to do container-local accounting.
LimitNPROC=infinity
LimitCORE=infinity

# Comment TasksMax if your systemd version does not support it.
# Only systemd 226 and above support this option.
TasksMax=infinity

# set delegate yes so that systemd does not reset the cgroups of docker containers
Delegate=yes

# kill only the docker process, not all processes in the cgroup
KillMode=process
OOMScoreAdjust=-500

[Install]
WantedBy=multi-user.target
`)

const generator: ImplementationGenerator = {
    component: 'docker.engine',
    technology: 'terraform',
    hosting: ['local.machine'],
    weight: 0,
    reason: 'Ansible is more specialized. Also using provisioners is a "last resort".',
    details: '"local-exec" provider',

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            attributes: {
                application_address: {
                    type: 'string',
                    default: '127.0.0.1',
                },
            },
            interfaces: {
                ...TerraformStandardOperations(),
                defaults: {
                    inputs: {
                        main: {
                            terraform: [
                                {
                                    required_providers: [
                                        {
                                            mysql: {
                                                source: 'hashicorp/local',
                                                version: '2.5.1',
                                            },
                                        },
                                    ],
                                },
                            ],
                            provider: {
                                local: [
                                    {
                                        endpoint: '127.0.0.1:{{ HOST.management_port }}',
                                        password: '{{ HOST.dbms_password }}',
                                        username: 'root',
                                    },
                                ],
                            },
                            resource: {
                                local_file: {
                                    tmp_service: {
                                        content: service,
                                        filename: '/tmp/docker.service',
                                    },
                                },
                                terraform_data: {
                                    docker: [
                                        {
                                            depends_on: 'local_file.tmp_service',
                                            provisioner: {
                                                'local-exec': [
                                                    {
                                                        inline: [
                                                            'curl -sSL https://get.docker.com | sudo sh',
                                                            'sudo groupadd -f docker',
                                                            'sudo usermod -aG docker {{ SELF.os_ssh_user }}',
                                                            'sleep 10s',
                                                            'cat /tmp/docker.service | sudo tee /lib/systemd/system/docker.service',
                                                            'sudo systemctl daemon-reload',
                                                            'sudo systemctl restart docker.service',
                                                        ],
                                                    },
                                                    // https://docs.docker.com/engine/install/ubuntu/#uninstall-docker-engine
                                                    {
                                                        inline: [
                                                            'sudo apt-get purge docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin docker-ce-rootless-extras -y',
                                                            'sudo rm -rf /var/lib/docker',
                                                            'sudo rm -rf /var/lib/containerd',
                                                        ],
                                                        when: 'destroy',
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
