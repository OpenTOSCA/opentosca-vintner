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

export function AnsibleSoftwareApplicationSourceArchiveCreateTasks(options: {artifact: string; type: NodeType}) {
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

export function AnsibleSoftwareApplicationStartTasks(options: {assert?: boolean; call?: boolean} = {}) {
    options.assert = options.assert ?? true
    options.call = options.call ?? true

    const tasks = []

    if (options.assert) {
        tasks.push({
            ...AnsibleAssertOperationTask(MANAGEMENT_OPERATIONS.START),
        })
    }

    tasks.push({
        ...AnsibleCopyManagementOperationTask(MANAGEMENT_OPERATIONS.START),
    })

    if (options.call) {
        tasks.push({
            ...AnsibleCallManagementOperationTask(MANAGEMENT_OPERATIONS.START),
        })
    }

    return tasks
}

export function AnsibleSoftwareApplicationStopTasks(options: {assert?: boolean; call?: boolean} = {}) {
    options.assert = options.assert ?? true
    options.call = options.call ?? true

    const tasks = []

    if (options.assert) {
        tasks.push({
            ...AnsibleAssertOperationTask(MANAGEMENT_OPERATIONS.STOP),
        })
    }

    tasks.push({
        ...AnsibleCopyManagementOperationTask(MANAGEMENT_OPERATIONS.STOP),
    })

    if (options.call) {
        tasks.push({
            ...AnsibleCallManagementOperationTask(MANAGEMENT_OPERATIONS.STOP),
        })
    }

    return tasks
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

export function BashSoftwareApplicationStart(options: {assert?: boolean} = {}) {
    options.assert = options.assert ?? true

    const parts = [BASH_HEADER]

    if (options.assert)
        parts.push(`
# Assert operation
${BashAssertManagementOperation(MANAGEMENT_OPERATIONS.START)}
`)

    parts.push(`    
# Copy operation
${BashCopyManagementOperation(MANAGEMENT_OPERATIONS.START)}
`)

    parts.push(`    
# Execute operation
${BashCallManagementOperation(MANAGEMENT_OPERATIONS.START)}
`)

    return utils.concat(parts.map(utils.trim))
}

export function BashSoftwareApplicationStop(options: {assert?: boolean} = {}) {
    options.assert = options.assert ?? true

    const parts = [BASH_HEADER]

    if (options.assert)
        parts.push(`
# Assert operation
${BashAssertManagementOperation(MANAGEMENT_OPERATIONS.STOP)}
`)

    parts.push(`    
# Copy operation
${BashCopyManagementOperation(MANAGEMENT_OPERATIONS.STOP)}
`)

    parts.push(`    
# Execute operation
${BashCallManagementOperation(MANAGEMENT_OPERATIONS.STOP)}
`)

    return utils.concat(parts.map(utils.trim))
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
