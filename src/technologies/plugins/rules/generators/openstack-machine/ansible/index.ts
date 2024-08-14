import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {MetadataGenerated, OpenstackProviderCredentials} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    id: 'openstack.machine::ansible',
    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {...MetadataGenerated()},
            properties: {...OpenstackProviderCredentials()},
            interfaces: {
                Standard: {
                    operations: {
                        create: {
                            implementation: {
                                primary: 'Ansible',
                                operation_host: 'ORCHESTRATOR',
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
                                                name: '{{ SELF.machine }}',
                                            },
                                        },
                                        {
                                            name: 'Open ports',
                                            'openstack.cloud.security_group_rule': {
                                                security_group: '{{ SELF.machine }}',
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
                                                name: '{{ SELF.machine }}',
                                                image: 'Ubuntu 22.04',
                                                key_name: 'default',
                                                flavor: '{{ SELF.flavor }}',
                                                network: '{{ SELF.os_network }}',
                                                security_groups: "{{ 'default,' + SELF.machine }}",
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
                                resultTemplate:
                                    '- name: SELF\n  attributes:\n    management_address: "{{ outputs.management_address | trim }}"\n',
                            },
                            outputs: {
                                management_address: null,
                            },
                        },
                        delete: {
                            implementation: {
                                primary: 'Ansible',
                                operation_host: 'ORCHESTRATOR',
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        {
                                            name: 'Delete VM',
                                            'openstack.cloud.server': {
                                                state: 'absent',
                                                name: '{{ SELF.machine }}',
                                                delete_fip: true,
                                                timeout: 360,
                                            },
                                        },
                                        {
                                            name: 'Delete security group',
                                            'openstack.cloud.security_group': {
                                                state: 'absent',
                                                name: '{{ SELF.machine }}',
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
