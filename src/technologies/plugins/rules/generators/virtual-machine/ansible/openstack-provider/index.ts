import * as files from '#files'
import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleOrchestratorOperation,
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
    OpenstackProviderCredentials,
} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    component: 'virtual.machine',
    technology: 'ansible',
    hosting: ['openstack.provider'],

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {
                ...OpenstackProviderCredentials(),
                ...OpenstackMachineCredentials(),
            },
            interfaces: {
                Standard: {
                    operations: {
                        create: {
                            implementation: {
                                ...AnsibleOrchestratorOperation(),
                                environment: {
                                    OS_AUTH_TYPE: {
                                        eval: '.::os_auth_type',
                                    },
                                    OS_AUTH_URL: {
                                        eval: '.::os_auth_url',
                                    },
                                    OS_IDENTITY_API_VERSION: {
                                        eval: '.::os_identity_api_version',
                                    },
                                    OS_REGION_NAME: {
                                        eval: '.::os_region_name',
                                    },
                                    OS_INTERFACE: {
                                        eval: '.::os_interface',
                                    },
                                    OS_APPLICATION_CREDENTIAL_ID: {
                                        eval: '.::os_application_credential_id',
                                    },
                                    OS_APPLICATION_CREDENTIAL_SECRET: {
                                        eval: '.::os_application_credential_secret',
                                    },
                                },
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        {
                                            name: 'Create security group',
                                            'openstack.cloud.security_group': {
                                                name: '{{ SELF.machine_name }}',
                                            },
                                        },
                                        {
                                            name: 'Open ports',
                                            'openstack.cloud.security_group_rule': {
                                                security_group: '{{ SELF.machine_name }}',
                                                protocol: 'tcp',
                                                port_range_min: '{{ item }}',
                                                port_range_max: '{{ item }}',
                                                remote_ip_prefix: '0.0.0.0/0',
                                                direction: 'ingress',
                                                ethertype: 'IPv4',
                                            },
                                            loop: '{{ SELF.ports | join("::") | split("::") | map("int") }}',
                                        },
                                        {
                                            name: 'Create VM',
                                            'openstack.cloud.server': {
                                                state: 'present',
                                                name: '{{ SELF.machine_name }}',
                                                image: '{{  ".artifacts::virtual_machine_image::file | eval }}',
                                                key_name: 'default',
                                                flavor: '{{ SELF.flavor }}',
                                                network: '{{ SELF.network }}',
                                                security_groups: "{{ 'default,' + SELF.machine_name }}",
                                                auto_ip: false,
                                                timeout: 360,
                                            },
                                            register: 'server_info',
                                        },
                                        {
                                            name: 'Set attributes',
                                            set_fact: {
                                                management_address: '{{ server_info.server.accessIPv4 }}',
                                            },
                                        },
                                    ],
                                },
                                resultTemplate: files.toYAML({
                                    name: 'SELF',
                                    attributes: {
                                        management_address: '{{ outputs.management_address | trim }}',
                                    },
                                }),
                            },
                            outputs: {
                                management_address: null,
                            },
                        },
                        delete: {
                            implementation: {
                                ...AnsibleOrchestratorOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        {
                                            name: 'Delete VM',
                                            'openstack.cloud.server': {
                                                state: 'absent',
                                                name: '{{ SELF.machine_name }}',
                                                delete_fip: true,
                                                timeout: 360,
                                            },
                                        },
                                        {
                                            name: 'Delete security group',
                                            'openstack.cloud.security_group': {
                                                state: 'absent',
                                                name: '{{ SELF.machine_name }}',
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
