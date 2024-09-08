export function TerraformRequiredVersion() {
    return {
        required_version: '>= 0.14.0',
    }
}

export function TerraformLocalProviderImport() {
    return {
        source: 'hashicorp/local',
        version: '2.5.1',
    }
}

export function TerraformGoogleProviderImport() {
    return {
        source: 'hashicorp/google',
        version: '4.67.0',
    }
}

export function TerraformGoogleProviderConfiguration() {
    return {
        credentials: '{{ SELF.gcp_service_account_file }}',
        project: '{{ SELF.gcp_project }}',
        region: '{{ SELF.gcp_region }}',
    }
}

export function TerraformKubernetesProviderImport() {
    return {
        source: 'hashicorp/kubernetes',
        version: '2.31.0',
    }
}

export function TerraformDockerProviderImport() {
    return {
        source: 'kreuzwerker/docker',
        version: '3.0.2',
    }
}

export function TerraformDockerProviderRemoteConfiguration() {
    return {
        host: 'ssh://{{ SELF.os_ssh_user }}@{{ SELF.os_ssh_host }}:22',
        ssh_opts: [
            '-i',
            '{{ SELF.os_ssh_key_file }}',
            '-o',
            'IdentitiesOnly=yes',
            '-o',
            'BatchMode=yes',
            '-o',
            'UserKnownHostsFile=/dev/null',
            '-o',
            'StrictHostKeyChecking=no',
        ],
    }
}

export function TerraformDockerProviderLocalConfiguration() {
    return {
        host: 'unix:///var/run/docker.sock',
    }
}

export function TerraformKubernetesProviderConfiguration() {
    return {
        client_certificate: '${file("{{ SELF.k8s_client_cert_file }}")}',
        client_key: '${file("{{ SELF.k8s_client_key_file }}")}',
        cluster_ca_certificate: '${file("{{ SELF.k8s_ca_cert_file }}")}',
        host: '{{ SELF.k8s_host }}',
    }
}

export function TerraformStandardOperations(env?: {[key: string]: any}) {
    return {
        Standard: {
            operations: {
                configure: {
                    implementation: {
                        primary: 'Terraform',
                        environment: env,
                    },
                },
                delete: {
                    implementation: {
                        primary: 'Terraform',
                        environment: env,
                    },
                },
            },
        },
    }
}

export function TerraformSSHConnection() {
    return {
        host: '{{ SELF.os_ssh_host }}',
        private_key: '${file("{{ SELF.os_ssh_key_file }}")}',
        type: 'ssh',
        user: '{{ SELF.os_ssh_user }}',
    }
}
