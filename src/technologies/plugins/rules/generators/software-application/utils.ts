import {MANAGEMENT_OPERATIONS} from '#spec/interface-definition'
import {NodeType} from '#spec/node-type'
import {
    AnsibleAssertOperationTask,
    AnsibleCallManagementOperationTask,
    AnsibleCopyManagementOperationTask,
    AnsibleCreateApplicationDirectoryTask,
    AnsibleCreateApplicationEnvironment,
    AnsibleCreateVintnerDirectory,
    AnsibleDeleteApplicationDirectoryTask,
    AnsibleUnarchiveSourceArchiveFileTask,
    AnsibleUnarchiveSourceArchiveUrlTask,
} from '#technologies/plugins/rules/utils/ansible'
import {
    BASH_HEADER,
    BashAssertManagementOperation,
    BashCallManagementOperation,
    BashCopyManagementOperation,
    BashCreateApplicationDirectory,
    BashCreateApplicationEnvironment,
    BashCreateVintnerDirectory,
    BashDeleteApplicationDirectory,
    BashDownloadSourceArchive,
    BashUnarchiveSourceArchiveFile,
} from '#technologies/plugins/rules/utils/utils'
import * as utils from '#utils'

export function AnsibleSoftwareApplicationSourceArchiveCreate(options: {artifact: string; type: NodeType}) {
    return [
        {
            ...AnsibleCreateApplicationDirectoryTask(),
        },
        {
            ...AnsibleUnarchiveSourceArchiveFileTask(options.artifact),
        },
        {
            ...AnsibleUnarchiveSourceArchiveUrlTask(options.artifact),
        },
        {
            ...AnsibleCreateVintnerDirectory(),
        },
        {
            ...AnsibleCreateApplicationEnvironment(options.type),
        },
        {
            ...AnsibleCopyManagementOperationTask(MANAGEMENT_OPERATIONS.CREATE),
        },
        {
            ...AnsibleCallManagementOperationTask(MANAGEMENT_OPERATIONS.CREATE),
        },
    ]
}

export function AnsibleSoftwareApplicationConfigureTasks() {
    return [
        {
            ...AnsibleCopyManagementOperationTask(MANAGEMENT_OPERATIONS.CONFIGURE),
        },
        {
            ...AnsibleCallManagementOperationTask(MANAGEMENT_OPERATIONS.CONFIGURE),
        },
    ]
}

export function AnsibleSoftwareApplicationStartTasks() {
    return [
        {
            ...AnsibleAssertOperationTask(MANAGEMENT_OPERATIONS.START),
        },
        {
            ...AnsibleCopyManagementOperationTask(MANAGEMENT_OPERATIONS.START),
        },
        {
            ...AnsibleCallManagementOperationTask(MANAGEMENT_OPERATIONS.START),
        },
    ]
}

export function AnsibleSoftwareApplicationStopTasks() {
    return [
        {
            ...AnsibleAssertOperationTask(MANAGEMENT_OPERATIONS.STOP),
        },
        {
            ...AnsibleCopyManagementOperationTask(MANAGEMENT_OPERATIONS.STOP),
        },
        {
            ...AnsibleCallManagementOperationTask(MANAGEMENT_OPERATIONS.STOP),
        },
    ]
}

export function AnsibleSoftwareApplicationDeleteTasks() {
    return [
        {
            ...AnsibleCopyManagementOperationTask(MANAGEMENT_OPERATIONS.DELETE),
        },
        {
            ...AnsibleCallManagementOperationTask(MANAGEMENT_OPERATIONS.DELETE),
        },
        {
            ...AnsibleDeleteApplicationDirectoryTask(),
        },
    ]
}

export function BashSoftwareApplicationSourceArchiveCreate(options: {name: string; type: NodeType; artifact: string}) {
    return utils.trim(`
${BASH_HEADER}

# Create application directory
${BashCreateApplicationDirectory()}

# Create application environment
${BashCreateApplicationEnvironment(options.type)}

# Download deployment artifact if required
${BashDownloadSourceArchive(options.name, options.artifact)}

# Extract deployment artifact
${BashUnarchiveSourceArchiveFile(options.name, options.artifact)}

# Create vintner directory
${BashCreateVintnerDirectory()}

# Copy operation
${BashCopyManagementOperation(MANAGEMENT_OPERATIONS.CREATE)}

# Execute operation
${BashCallManagementOperation(MANAGEMENT_OPERATIONS.CREATE)}
`)
}

export function BashSoftwareApplicationConfigure() {
    return utils.trim(`
${BASH_HEADER}

# Copy operation
${BashCopyManagementOperation(MANAGEMENT_OPERATIONS.CONFIGURE)}

# Execute operation
${BashCallManagementOperation(MANAGEMENT_OPERATIONS.CONFIGURE)}
`)
}

// TODO: assert
export function BashSoftwareApplicationStart(options: {assert?: boolean} = {}) {
    options.assert = options.assert ?? true

    return utils.trim(`
${BASH_HEADER}

# Assert operation
${BashAssertManagementOperation(MANAGEMENT_OPERATIONS.START)}

# Copy operation
${BashCopyManagementOperation(MANAGEMENT_OPERATIONS.START)}

# Execute operation
${BashCallManagementOperation(MANAGEMENT_OPERATIONS.START)}
`)
}

// TODO: assert
export function BashSoftwareApplicationStop(options: {assert?: boolean} = {}) {
    return utils.trim(`    
${BASH_HEADER}

# Assert operation
${BashAssertManagementOperation(MANAGEMENT_OPERATIONS.STOP)}

# Copy operation
${BashCopyManagementOperation(MANAGEMENT_OPERATIONS.STOP)}

# Execute operation
${BashCallManagementOperation(MANAGEMENT_OPERATIONS.STOP)}
`)
}

export function BashSoftwareApplicationDelete() {
    return utils.trim(`
${BASH_HEADER}

# Copy operation
${BashCopyManagementOperation(MANAGEMENT_OPERATIONS.DELETE)}

# Execute operation
${BashCallManagementOperation(MANAGEMENT_OPERATIONS.DELETE)}

# Delete application directory
${BashDeleteApplicationDirectory()}
`)
}

export function AnsibleSoftwareApplicationAptPackageCreateTasks() {
    return [
        {
            name: 'run setup script',
            'ansible.builtin.shell': 'curl -fsSL {{ ".artifacts::apt_package::script" | eval }} | sudo -E bash -',
            args: {
                executable: '/bin/bash',
            },
            when: '".artifacts::apt_package::script" | eval != ""',
        },
        {
            name: 'add apt key',
            'ansible.builtin.apt_key': {
                url: '{{ ".artifacts::apt_package::key" | eval }}',
                keyring: '/usr/share/keyrings/{{ ".artifacts::apt_package::repository" | eval }}.gpg',
                state: 'present',
            },
            when: '".artifacts::apt_package::key" | eval != ""',
        },
        {
            name: 'add apt repository',
            'ansible.builtin.apt_repository': {
                repo: 'deb [signed-by=/usr/share/keyrings/{{ ".artifacts::apt_package::repository" | eval }}.gpg] {{ ".artifacts::apt_package::source" | eval }}',
                filename: '{{ ".artifacts::apt_package::repository" | eval }}',
                state: 'present',
            },
            when: '".artifacts::apt_package::source" | eval != ""',
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
            when: '".artifacts::apt_package::dependencies" | eval != ""',
        },
        {
            name: 'install package',
            'ansible.builtin.apt': {
                name: '{{ ".artifacts::apt_package::file" | eval }}',
                state: 'present',
            },
            environment:
                '{{ ".artifacts::apt_package::env" | eval | split | map("split", "=") | community.general.dict }}',
        },
        {
            ...AnsibleCreateApplicationDirectoryTask(),
        },
        {
            ...AnsibleCopyManagementOperationTask(MANAGEMENT_OPERATIONS.CREATE),
        },
        {
            ...AnsibleCallManagementOperationTask(MANAGEMENT_OPERATIONS.CREATE),
        },
    ]
}

export function AnsibleSoftwareApplicationAptPackageDeleteTask() {
    return {
        name: 'uninstall package',
        'ansible.builtin.apt': {
            name: '{{ ".artifacts::apt_package::file" | eval }}',
            state: 'absent',
        },
    }
}

export function BashSoftwareApplicationAptPackageCreate(options: {name: string; type: NodeType; artifact: string}) {
    return utils.trim(`
${BASH_HEADER}

# Run setup script 
if [[ "{{ ".artifacts::apt_package::script" | eval }}" != "" ]]; then 
    curl -fsSL {{ ".artifacts::apt_package::script" | eval }} | sudo -E bash -
fi

# Add apt key
if [[ "{{ ".artifacts::apt_package::key" | eval }}" != "" ]]; then 
    curl -1sLf {{ ".artifacts::apt_package::key" | eval }} | gpg --dearmor --yes -o /usr/share/keyrings/{{ ".artifacts::apt_package::repository" | eval }}.gpg
fi

# Add apt repository
if [[ "{{ ".artifacts::apt_package::source" | eval }}" != "" ]]; then 
    echo "deb [signed-by=/usr/share/keyrings/{{ ".artifacts::apt_package::repository" | eval }}.gpg] {{ ".artifacts::apt_package::source" | eval }}" | tee {{ ".artifacts::apt_package::repository" | eval }}
fi

# Update apt cache
apt-get update -y

# Install dependencies
if [[ "{{ ".artifacts::apt_package::dependencies" | eval }}" != "" ]]; then 
    apt-get install {{ ".artifacts::apt_package::dependencies" | eval | split(",") | map("trim") }} -y
fi

# Install package
{{ ".artifacts::apt_package::env" | eval }} apt-get install {{ ".artifacts::apt_package::file" | eval }} -y

# Create application directory
${BashCreateApplicationDirectory()}

# Create application environment
${BashCreateApplicationEnvironment(options.type)}

# Create vintner directory
${BashCreateVintnerDirectory()}

# Copy operation
${BashCopyManagementOperation(MANAGEMENT_OPERATIONS.CREATE)}

# Execute operation
${BashCallManagementOperation(MANAGEMENT_OPERATIONS.CREATE)}
`)
}

export function BashSoftwareApplicationAptPackageDelete() {
    return utils.trim(`
# Uninstall package
apt-get uninstall {{ ".artifacts::apt_package::file" | eval }} -y
`)
}
