import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleOrchestratorOperation,
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    id: 'mysql.database::ansible::mysql.dbms',
    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {
                ...OpenstackMachineCredentials(),
            },
            interfaces: {
                Standard: {
                    operations: {
                        create: {
                            implementation: {
                                ...AnsibleOrchestratorOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        {
                                            name: 'create database',
                                            'community.mysql.mysql_db': {
                                                name: '{{ SELF.database_name }}',
                                                login_host: '{{ HOST.management_address }}',
                                                login_password: '{{ HOST.dbms_password }}',
                                                login_port: '{{ HOST.management_port }}',
                                                login_user: 'root',
                                            },
                                        },
                                        {
                                            name: 'create user (with privileges)',
                                            'community.mysql.mysql_user': {
                                                name: '{{ SELF.database_user }}',
                                                password: '{{ SELF.database_password }}',
                                                host: '%',
                                                priv: '*.*:ALL',
                                                login_host: '{{ HOST.management_address }}',
                                                login_password: '{{ HOST.dbms_password }}',
                                                login_port: '{{ HOST.management_port }}',
                                                login_user: 'root',
                                            },
                                        },
                                    ],
                                },
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
