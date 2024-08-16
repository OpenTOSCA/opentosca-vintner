import {MANAGEMENT_OPERATIONS} from '#spec/interface-definition'
import {AnsibleTask, ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleCallOperationTask,
    AnsibleCopyOperationTask,
    AnsibleHostOperation,
    AnsibleHostOperationPlaybookArgs,
    AnsibleWaitForSSHTask,
    ApplicationDirectory,
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
    UnfurlArtifactFile,
    hasOperation,
    mapProperties,
} from '#technologies/plugins/rules/utils'

const service = `
[Unit]
After=network.target

[Service]
Type=simple
ExecStart=. /.vintner/start.sh
WorkingDirectory={{ SELF.application_directory }}
EnvironmentFile={{ SELF.application_directory }}/.env

[Install]
WantedBy=multi-user.target
`

// TODO: inherit management operations
// TODO: inherit artifacts

// TODO: assert artifact is zip file

const generator: ImplementationGenerator = {
    id: 'software.component::ansible#source.archive@openstack.machine',
    generate: (name, type) => {
        const configure: AnsibleTask[] = [
            {
                ...AnsibleWaitForSSHTask(),
            },
            {
                name: 'create .env file',
                copy: {
                    dest: '{{ SELF.application_directory }}/.env',
                    content: mapProperties(type, {format: 'ini'}),
                },
            },
        ]

        if (hasOperation(name, type, MANAGEMENT_OPERATIONS.CONFIGURE)) {
            configure.push({
                ...AnsibleCopyOperationTask(name, type, MANAGEMENT_OPERATIONS.CONFIGURE),
            })

            configure.push({
                ...AnsibleCallOperationTask(MANAGEMENT_OPERATIONS.CONFIGURE),
            })
        }

        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {
                ...OpenstackMachineCredentials(),
                ...ApplicationDirectory(),
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
                                            name: 'create application directory',
                                            'ansible.builtin.file': {
                                                path: '{{ SELF.application_directory }}',
                                                state: 'directory',
                                            },
                                        },
                                        {
                                            name: 'extract deployment artifact in application directory',
                                            unarchive: {
                                                src: UnfurlArtifactFile('source_archive'),
                                                dest: '{{ SELF.application_directory }}',
                                            },
                                        },
                                        {
                                            name: 'create vintner directory',
                                            'ansible.builtin.file': {
                                                path: '{{ SELF.application_directory }}/.vintner',
                                                state: 'directory',
                                            },
                                        },
                                        {
                                            name: 'create service',
                                            copy: {
                                                dest: '/etc/systemd/system/{{ SELF.application_name }}.service',
                                                content: service,
                                            },
                                        },
                                        {
                                            name: 'enable service',
                                            'ansible.builtin.systemd': {
                                                name: '{{ SELF.application_name }}',
                                                state: 'stopped',
                                                enabled: 'yes',
                                                daemon_reload: 'yes',
                                            },
                                        },
                                    ],
                                },
                                playbookArgs: [...AnsibleHostOperationPlaybookArgs()],
                            },
                        },
                        configure: {
                            implementation: {
                                ...AnsibleHostOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: configure,
                                },
                                playbookArgs: [...AnsibleHostOperationPlaybookArgs()],
                            },
                        },
                        start: {
                            implementation: {
                                ...AnsibleHostOperation(),
                            },
                            inputs: {
                                playbook: {
                                    q: [
                                        {
                                            name: 'wait for ssh',
                                            wait_for_connection: null,
                                        },
                                        {
                                            name: 'copy management operation',
                                            'ansible.builtin.copy': {
                                                dest: `{{ SELF.application_directory }}/.vintner/start.sh`,
                                                content: '{{ ".artifacts::source_archive::entry_point" | eval }}',
                                                mode: '0755',
                                            },
                                        },
                                        {
                                            name: 'start service',
                                            'ansible.builtin.systemd': {
                                                name: '{{ SELF.application_name }}',
                                                state: 'started',
                                                enabled: 'yes',
                                                daemon_reload: 'yes',
                                            },
                                        },
                                    ],
                                },
                                playbookArgs: [...AnsibleHostOperationPlaybookArgs()],
                            },
                        },
                        stop: {
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
                                            name: 'stop service',
                                            'ansible.builtin.systemd': {
                                                name: '{{ SELF.application_name }}',
                                                state: 'stopped',
                                            },
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
                                            name: 'delete systemd service',
                                            'ansible.builtin.file': {
                                                path: '/etc/systemd/system/{{ SELF.application_name }}.service',
                                                state: 'absent',
                                            },
                                        },
                                        {
                                            name: 'reload daemon',
                                            'ansible.builtin.systemd': {
                                                daemon_reload: true,
                                            },
                                        },
                                        {
                                            name: 'delete application directory',
                                            'ansible.builtin.file': {
                                                path: '{{ SELF.application_directory }}',
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
