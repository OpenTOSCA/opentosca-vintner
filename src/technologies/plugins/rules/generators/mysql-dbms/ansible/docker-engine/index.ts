import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {MetadataGenerated, MetadataUnfurl, OpenstackMachineCredentials} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    id: 'mysql.dbms::ansible::docker.engine',
    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {...OpenstackMachineCredentials()},
            attributes: {
                application_address: {
                    type: 'string',
                    default: {
                        concat: ['localhost', ':', '{{ SELF.application_port }}'],
                    },
                },
            },
            interfaces: {
                Standard: {
                    operations: {
                        create: {
                            implementation: {
                                primary: 'Ansible',
                                operation_host: 'HOST',
                                environment: {
                                    ANSIBLE_HOST_KEY_CHECKING: 'False',
                                },
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        {
                                            name: 'wait for ssh',
                                            wait_for_connection: null,
                                        },
                                        {
                                            name: 'start container',
                                            'community.docker.docker_container': {
                                                name: '{{ SELF.dbms_name }}',
                                                image: '{{ SELF.dbms_image }}',
                                                network_mode: 'host',
                                                env: {
                                                    MYSQL_ROOT_PASSWORD: '{{ SELF.dbms_password | string }}',
                                                },
                                            },
                                        },
                                    ],
                                },
                                playbookArgs: [
                                    '--become',
                                    '--key-file={{ SELF.os_ssh_key_file }}',
                                    '--user={{ SELF.os_ssh_user }}',
                                ],
                            },
                        },
                        delete: 'exit 0',
                    },
                },
            },
        }
    },
}

export default generator
