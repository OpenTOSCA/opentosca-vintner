import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleHostEndpointCapability,
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
    OpenstackMachineHost,
    TerraformStandardOperations,
} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    component: 'mysql.dbms',
    technology: 'terraform',
    artifact: 'dbms.image',
    hosting: ['docker.engine', 'remote.machine'],
    weight: 0.5,
    reason: 'Docker Compose is more specialized.',
    details: '"docker_container" and "docker_image" resources',

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {
                ...OpenstackMachineCredentials(),
                ...OpenstackMachineHost(),
            },
            attributes: {
                application_address: {
                    type: 'string',
                    default: '127.0.0.1',
                },
                application_port: {
                    type: 'integer',
                    default: 3306,
                },
                management_address: {
                    type: 'string',
                    default: {
                        eval: '.::.requirements::[.name=host]::.target::management_address',
                    },
                },
                management_port: {
                    type: 'integer',
                    default: 3306,
                },
            },
            capabilities: {
                ...AnsibleHostEndpointCapability(),
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
                                            docker: {
                                                source: 'kreuzwerker/docker',
                                                version: '3.0.2',
                                            },
                                        },
                                    ],
                                },
                            ],
                            provider: {
                                docker: [
                                    {
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
                                    },
                                ],
                            },
                            resource: {
                                docker_container: {
                                    application: [
                                        {
                                            name: '{{ SELF.dbms_name }}',
                                            image: '${docker_image.image.image_id}',
                                            network_mode: 'host',
                                            env: ['MYSQL_ROOT_PASSWORD={{ SELF.dbms_password }}'],
                                        },
                                    ],
                                },
                                docker_image: {
                                    image: [
                                        {
                                            name: 'mysql:{{ ".artifacts::dbms_image::file" | eval }}',
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
