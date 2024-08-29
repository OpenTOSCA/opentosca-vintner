import * as files from '#files'
import {MANAGEMENT_OPERATIONS} from '#spec/interface-definition'
import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    AnsibleAssertOperationTask,
    AnsibleCallOperationTask,
    AnsibleCopyOperationTask,
    AnsibleCreateApplicationDirectoryTask,
    AnsibleCreateApplicationEnvironment,
    AnsibleCreateVintnerDirectory,
    AnsibleDeleteApplicationDirectoryTask,
    AnsibleHostOperation,
    AnsibleHostOperationPlaybookArgs,
    AnsibleUnarchiveZipArchiveFileTask,
    AnsibleUnarchiveZipArchiveUrlTask,
    AnsibleWaitForSSHTask,
    ApplicationDirectory,
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
} from '#technologies/plugins/rules/utils'

const generator: ImplementationGenerator = {
    component: 'service.application',
    technology: 'ansible',
    artifact: 'zip.archive',
    hosting: ['*', 'virtual.machine'],
    weight: 1,
    reason: 'Primary use case due to the specialization of Ansible. Special integration for systemd.',
    details:
        '"ansible.builtin.file", "ansible.builtin.unarchive", "ansible.builtin.copy", "ansible.builtin.fail", "ansible.builtin.shell", and "ansible.builtin.systemd" tasks with "when" statements',

    generate: (name, type) => {
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
                                            name: 'install operational dependencies',
                                            'ansible.builtin.apt': {
                                                name: 'unzip',
                                                update_cache: 'yes',
                                            },
                                        },
                                        {
                                            ...AnsibleCreateApplicationDirectoryTask(),
                                        },
                                        {
                                            ...AnsibleUnarchiveZipArchiveFileTask(),
                                        },
                                        {
                                            ...AnsibleUnarchiveZipArchiveUrlTask(),
                                        },
                                        {
                                            ...AnsibleCreateVintnerDirectory(),
                                        },
                                        {
                                            ...AnsibleCreateApplicationEnvironment(type),
                                        },
                                        {
                                            ...AnsibleCopyOperationTask(MANAGEMENT_OPERATIONS.CREATE),
                                        },
                                        {
                                            ...AnsibleCallOperationTask(MANAGEMENT_OPERATIONS.CREATE),
                                        },
                                        {
                                            name: 'create service',
                                            copy: {
                                                dest: '/etc/systemd/system/{{ SELF.application_name }}.service',
                                                content: files.toINI({
                                                    Unit: {
                                                        After: 'network.target',
                                                    },
                                                    Service: {
                                                        Type: 'simple',
                                                        ExecStart: '/usr/bin/bash -c ". ./.vintner/start.sh"',
                                                        WorkingDirectory: '{{ SELF.application_directory }}',
                                                        EnvironmentFile: '{{ SELF.application_directory }}/.env',
                                                    },
                                                    Install: {
                                                        WantedBy: 'multi-user.target',
                                                    },
                                                }),
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
                                    q: [
                                        {
                                            ...AnsibleWaitForSSHTask(),
                                        },
                                        {
                                            ...AnsibleCopyOperationTask(MANAGEMENT_OPERATIONS.CONFIGURE),
                                        },
                                        {
                                            ...AnsibleCallOperationTask(MANAGEMENT_OPERATIONS.CONFIGURE),
                                        },
                                    ],
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
                                            ...AnsibleWaitForSSHTask(),
                                        },
                                        {
                                            ...AnsibleAssertOperationTask(MANAGEMENT_OPERATIONS.START),
                                        },
                                        {
                                            ...AnsibleCopyOperationTask(MANAGEMENT_OPERATIONS.START),
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
                                            ...AnsibleCopyOperationTask(MANAGEMENT_OPERATIONS.STOP),
                                        },
                                        {
                                            ...AnsibleCallOperationTask(MANAGEMENT_OPERATIONS.STOP),
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
                                            ...AnsibleCopyOperationTask(MANAGEMENT_OPERATIONS.DELETE),
                                        },
                                        {
                                            ...AnsibleCallOperationTask(MANAGEMENT_OPERATIONS.DELETE),
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
                                            ...AnsibleDeleteApplicationDirectoryTask(),
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
