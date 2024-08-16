import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleHostOperation,
    AnsibleHostOperationPlaybookArgs,
    AnsibleWaitForSSHTask,
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    id: 'software.component::ansible#apt.package@openstack.machine',
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
                                ...AnsibleHostOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        {
                                            ...AnsibleWaitForSSHTask(),
                                        },
                                        {
                                            name: 'add apt key',
                                            'ansible.builtin.apt_key': {
                                                url: '{{ ".artifacts::apt_package::key" | eval }}',
                                                keyring:
                                                    '/usr/share/keyrings/{{ ".artifacts::apt_package::repository" | eval }}.gpg',
                                                state: 'present',
                                            },
                                            when: '".artifacts::apt_package::key" | eval != None',
                                        },
                                        {
                                            name: 'add apt repository',
                                            'ansible.builtin.apt_repository': {
                                                repo: 'deb [signed-by=/usr/share/keyrings/{{ ".artifacts::apt_package::repository" | eval }}.gpg] {{ ".artifacts::apt_package::source" | eval }}',
                                                filename: '{{ ".artifacts::apt_package::repository" | eval }}',
                                                state: 'present',
                                            },
                                            when: '".artifacts::apt_package::source" | eval != None',
                                        },
                                        {
                                            name: 'update apt cache',
                                            'ansible.builtin.apt': {
                                                update_cache: 'yes',
                                            },
                                        },
                                        {
                                            name: 'install dependencies',
                                            'ansible.builtin.apt': {
                                                name: '{{ ".artifacts::apt_package::dependencies" | eval | split(",") | map("trim") }}',
                                                state: 'present',
                                            },
                                            when: '".artifacts::apt_package::dependencies" | eval != None',
                                        },
                                        {
                                            name: 'install package',
                                            'ansible.builtin.apt': {
                                                name: '{{ ".artifacts::apt_package::.file" | eval }}',
                                                state: 'present',
                                            },
                                            environment:
                                                '{{ ".artifacts::apt_package::.file" | eval | split | map("split", "=") | community.general.dict }}',
                                        },
                                    ],
                                },
                                playbookArgs: [...AnsibleHostOperationPlaybookArgs()],
                            },
                        },
                        delete: {
                            implementation: {
                                ...AnsibleHostOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        {
                                            ...AnsibleWaitForSSHTask(),
                                        },
                                        {
                                            name: 'uninstall package',
                                            'ansible.builtin.apt': {
                                                name: '{{ ".artifacts::apt_package::.file | eval }}',
                                                state: 'absent',
                                            },
                                        },
                                    ],
                                },
                                playbookArgs: [...AnsibleHostOperationPlaybookArgs()],
                            },
                        },
                    },
                },
            },
        }
    },
}

export default generator
