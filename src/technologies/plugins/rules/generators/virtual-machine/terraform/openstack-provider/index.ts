import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
    OpenstackProviderCredentials,
    TerraformStandardOperations,
} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    component: 'virtual.machine',
    technology: 'terraform',
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
                ...TerraformStandardOperations(),
                defaults: {
                    outputs: {
                        management_address: 'management_address',
                    },
                    inputs: {
                        main: {
                            terraform: [
                                {
                                    required_providers: [
                                        {
                                            openstack: {
                                                source: 'terraform-provider-openstack/openstack',
                                                version: '~> 1.48.0',
                                            },
                                        },
                                    ],
                                    required_version: '>= 0.14.0',
                                },
                            ],
                            provider: {
                                openstack: [
                                    {
                                        application_credential_id: '{{ SELF.os_application_credential_id }}',
                                        application_credential_secret: '{{ SELF.os_application_credential_secret }}',
                                        auth_url: '{{ SELF.os_auth_url }}',
                                        region: '{{ SELF.os_region_name }}',
                                    },
                                ],
                            },
                            output: {
                                management_address: [
                                    {
                                        value: '${yamldecode(openstack_compute_instance_v2.machine.access_ip_v4)}',
                                    },
                                ],
                            },
                            resource: {
                                openstack_compute_instance_v2: {
                                    machine: [
                                        {
                                            flavor_name: '{{ SELF.flavor }}',
                                            image_name: '{{  ".artifacts::image::file | eval }}',
                                            key_pair: 'default',
                                            name: '{{ SELF.machine_name }}',
                                            network: [
                                                {
                                                    name: '{{ SELF.network }}',
                                                },
                                            ],
                                            security_groups: [
                                                'default',
                                                '${openstack_networking_secgroup_v2.ports.name}',
                                            ],
                                        },
                                    ],
                                },
                                openstack_networking_secgroup_rule_v2: {
                                    port: [
                                        {
                                            direction: 'ingress',
                                            ethertype: 'IPv4',
                                            for_each: '${toset(split("::", "{{ SELF.ports | join("::") }}"))}',
                                            port_range_max: '${each.value}',
                                            port_range_min: '${each.value}',
                                            protocol: 'tcp',
                                            remote_ip_prefix: '0.0.0.0/0',
                                            security_group_id: '${openstack_networking_secgroup_v2.ports.id}',
                                        },
                                    ],
                                },
                                openstack_networking_secgroup_v2: {
                                    ports: [
                                        {
                                            name: '{{ SELF.machine_name }}',
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
