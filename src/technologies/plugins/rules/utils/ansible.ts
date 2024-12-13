import {MANAGEMENT_OPERATIONS} from '#spec/interface-definition'
import {NodeType} from '#spec/node-type'
import {DockerCompose} from '#technologies/plugins/rules/utils/compose'
import {
    ApplicationEnvironment,
    ApplicationSystemdUnit,
    JinjaWhenManagementOperationDefined,
    JinjaWhenManagementOperationUndefined,
    JinjaWhenSourceArchiveFile,
    JinjaWhenSourceArchiveUrl,
    ManagementOperation,
    SourceArchiveExtraOpts,
    SourceArchiveFile,
    SourceArchiveUrl,
} from '#technologies/plugins/rules/utils/utils'

export type AnsibleTaskOptions = {
    name: string
    when?: string
    register?: string
}

export type AnsibleModuleOptions = {
    name: string
    state?: 'present' | 'absent'
}

export function AnsibleHostEndpointCapability() {
    return {
        endpoint: {
            type: 'unfurl.capabilities.Endpoint.Ansible',
            properties: {
                connection: 'ssh',
                host: {eval: '.parent::management_address'},
            },
        },
    }
}

export function AnsibleHostOperation() {
    return {
        primary: 'Ansible',
        operation_host: 'HOST',
        environment: {
            ANSIBLE_HOST_KEY_CHECKING: 'False',
        },
    }
}

export function AnsibleOrchestratorOperation() {
    return {
        primary: 'Ansible',
        operation_host: 'ORCHESTRATOR',
    }
}

export function AnsibleKubernetesCredentialsEnvironment() {
    return {
        K8S_AUTH_HOST: {
            eval: '.::k8s_host',
        },
        K8S_AUTH_SSL_CA_CERT: {
            eval: '.::k8s_ca_cert_file',
        },
        K8S_AUTH_CERT_FILE: {
            eval: '.::k8s_client_cert_file',
        },
        K8S_AUTH_KEY_FILE: {
            eval: '.::k8s_client_key_file',
        },
    }
}

export function AnsibleGCPCredentialsEnvironment() {
    return {
        GCP_SERVICE_ACCOUNT_FILE: {
            eval: '.::gcp_service_account_file',
        },
        GCP_AUTH_KIND: 'serviceaccount',
    }
}

export function AnsibleHostOperationPlaybookArgs() {
    return ['--become', '--key-file={{ SELF.os_ssh_key_file }}', '--user={{ SELF.os_ssh_user }}']
}

export function AnsibleWaitForSSHTask() {
    return {
        name: 'wait for ssh',
        wait_for_connection: null,
    }
}

export function AnsibleCreateApplicationDirectoryTask() {
    return {
        name: 'create application directory',
        'ansible.builtin.file': {
            path: '{{ SELF.application_directory }}',
            state: 'directory',
        },
    }
}

export function AnsibleDeleteApplicationDirectoryTask() {
    return {
        name: 'delete application directory',
        'ansible.builtin.file': {
            path: '{{ SELF.application_directory }}',
            state: 'absent',
        },
    }
}

export function AnsibleUnarchiveSourceArchiveFileTask(type: string) {
    return {
        name: 'extract deployment artifact in application directory',
        'ansible.builtin.unarchive': {
            src: SourceArchiveFile(type),
            dest: '{{ SELF.application_directory }}',
            extra_opts: SourceArchiveExtraOpts(type),
        },
        when: JinjaWhenSourceArchiveFile(type),
    }
}

export function AnsibleUnarchiveSourceArchiveUrlTask(type: string) {
    return {
        name: 'extract deployment artifact from URL in application directory',
        'ansible.builtin.unarchive': {
            src: SourceArchiveUrl(type),
            dest: '{{ SELF.application_directory }}',
            remote_src: 'yes',
            extra_opts: SourceArchiveExtraOpts(type),
        },
        when: JinjaWhenSourceArchiveUrl(type),
    }
}

export function AnsibleCreateVintnerDirectory() {
    return {
        name: 'create vintner directory',
        'ansible.builtin.file': {
            path: '{{ SELF.application_directory }}/.vintner',
            state: 'directory',
        },
    }
}

export function AnsibleCreateApplicationSystemdUnit() {
    return {
        name: 'create service',
        'ansible.builtin.copy': {
            dest: '/etc/systemd/system/{{ SELF.application_name }}.service',
            content: ApplicationSystemdUnit(),
        },
    }
}

export function AnsibleEnableApplicationSystemdUnit() {
    return {
        name: 'enable service',
        'ansible.builtin.systemd': {
            name: '{{ SELF.application_name }}',
            state: 'stopped',
            enabled: 'yes',
            daemon_reload: 'yes',
        },
    }
}

export function AnsibleStartApplicationSystemdUnit() {
    return {
        name: 'start service',
        'ansible.builtin.systemd': {
            name: '{{ SELF.application_name }}',
            state: 'started',
            enabled: 'yes',
            daemon_reload: 'yes',
        },
    }
}

export function AnsibleStopApplicationSystemdUnit() {
    return {
        name: 'stop service',
        'ansible.builtin.systemd': {
            name: '{{ SELF.application_name }}',
            state: 'stopped',
        },
    }
}

export function AnsibleDeleteApplicationSystemdUnit() {
    return {
        name: 'delete systemd service',
        'ansible.builtin.file': {
            path: '/etc/systemd/system/{{ SELF.application_name }}.service',
            state: 'absent',
        },
    }
}

export function AnsibleSystemdDaemonReload() {
    return {
        name: 'reload daemon',
        'ansible.builtin.systemd': {
            daemon_reload: true,
        },
    }
}

export function AnsibleCreateApplicationEnvironment(type: NodeType) {
    return {
        name: 'create .env file',
        'ansible.builtin.copy': {
            dest: '{{ SELF.application_directory }}/.env',
            content: ApplicationEnvironment(type),
        },
    }
}

export function AnsibleCopyManagementOperationTask(operation: MANAGEMENT_OPERATIONS) {
    return {
        name: 'copy management operation',
        'ansible.builtin.copy': {
            dest: `{{ SELF.application_directory }}/.vintner/${operation}.sh`,
            content: ManagementOperation(operation),
            mode: '0755',
        },
        when: JinjaWhenManagementOperationDefined(operation),
    }
}

export function AnsibleCallManagementOperationTask(operation: MANAGEMENT_OPERATIONS) {
    return {
        name: 'call management operation',
        'ansible.builtin.shell': `. .env && . .vintner/${operation}.sh`,
        args: {
            chdir: '{{ SELF.application_directory }}',
            executable: '/bin/bash',
        },
        when: JinjaWhenManagementOperationDefined(operation),
    }
}

export function AnsibleTouchComposeTask(options: {suffix: string}) {
    return {
        name: 'touch compose',
        register: 'compose',
        'ansible.builtin.tempfile': {
            suffix: `${options.suffix}.compose.yaml`,
        },
    }
}

export function AnsibleCreateComposeTask(options: {manifest: DockerCompose}) {
    return {
        name: 'create compose',
        'ansible.builtin.copy': {
            dest: '{{ compose.path }}',
            content: '{{ manifest | to_yaml }}',
        },
        vars: {
            manifest: options.manifest,
        },
    }
}

export function AnsibleCreateSSHConfig() {
    return {
        name: 'add ssh credentials',
        'community.general.ssh_config': {
            user: "{{ lookup('env', 'USER') }}",
            host: '{{ SELF.os_ssh_host }}',
            remote_user: '{{ SELF.os_ssh_user }}',
            identity_file: '{{ SELF.os_ssh_key_file }}',
            strict_host_key_checking: 'no',
            //identities_only: 'yes',
            user_known_hosts_file: '/dev/null',
        },
    }
}

export function AnsibleDeleteSSHConfig() {
    return {
        name: 'remove ssh credentials',
        'community.general.ssh_config': {
            user: "{{ lookup('env', 'USER') }}",
            host: '{{ SELF.os_ssh_host }}',
            state: 'absent',
        },
    }
}

export function AnsibleApplyComposeTasks(options: {remote?: boolean} = {}) {
    const tasks = []

    if (options.remote) {
        tasks.push(AnsibleCreateSSHConfig())
    }

    tasks.push({
        name: 'apply compose',
        'ansible.builtin.shell': `docker compose -f {{ compose.path }} up -d`,
        args: {
            executable: '/usr/bin/bash',
        },
        environment: {
            DOCKER_HOST: options.remote ? 'ssh://{{ SELF.os_ssh_host }}' : undefined,
        },
    })

    if (options.remote) {
        tasks.push(AnsibleDeleteSSHConfig())
    }

    return tasks
}

export function AnsibleUnapplyComposeTasks(options: {remote?: boolean} = {}) {
    const tasks = []

    if (options.remote) {
        tasks.push(AnsibleCreateSSHConfig())
    }

    tasks.push({
        name: 'unapply compose',
        'ansible.builtin.shell': 'docker compose -f {{ compose.path }} down',
        args: {
            executable: '/usr/bin/bash',
        },
        environment: {
            DOCKER_HOST: options.remote ? 'ssh://{{ SELF.os_ssh_host }}' : undefined,
        },
    })

    if (options.remote) {
        tasks.push(AnsibleDeleteSSHConfig())
    }

    return tasks
}

export function AnsibleTask(options: {task: AnsibleTaskOptions; module: string; options: any}) {
    return {
        name: options.task.name,
        when: options.task.when,
        register: options.task.register,
        [options.module]: {
            ...options.options,
        },
    }
}

/**
 * https://docs.ansible.com/ansible/latest/collections/community/docker/docker_container_module.html
 */
export function AnsibleDockerContainerTask(
    options: AnsibleTaskOptions & {
        container: AnsibleModuleOptions & {
            image?: string
            command?: string
            ports?: string[]
            network_mode?: string
            env?: {[key: string]: string}
        }
    }
) {
    return AnsibleTask({
        task: options,
        module: 'community.docker.docker_container',
        options: options.container,
    })
}

/**
 * https://docs.ansible.com/ansible/latest/collections/community/mysql/mysql_db_module.html
 */
export function AnsibleMySQLDatabaseTask(
    options: AnsibleTaskOptions & {
        database: AnsibleModuleOptions & {
            login_host: string
            login_password: string
            login_port: string
            login_user: string
        }
    }
) {
    return AnsibleTask({
        task: options,
        module: 'community.mysql.mysql_db',
        options: options.database,
    })
}

/**
 * https://docs.ansible.com/ansible/latest/collections/community/mysql/mysql_user_module.html
 */
export function AnsibleMySQLUserTask(
    options: AnsibleTaskOptions & {
        user: AnsibleModuleOptions & {
            password: string
            host: string
            priv: string
            login_host: string
            login_password: string
            login_port: string
            login_user: string
        }
    }
) {
    return AnsibleTask({
        task: options,
        module: 'community.mysql.mysql_user',
        options: options.user,
    })
}

/**
 * https://docs.ansible.com/ansible/latest/collections/ansible/builtin/apt_module.html
 */
export function AnsibleAptTask(
    options: AnsibleTaskOptions & {
        apt: AnsibleModuleOptions & {}
    }
) {
    return AnsibleTask({
        task: options,
        module: 'ansible.builtin.apt',
        options: options.apt,
    })
}

export function AnsibleAssertOperationTask(operation: MANAGEMENT_OPERATIONS) {
    return {
        name: 'assert management operation',
        'ansible.builtin.fail': {
            msg: `Management operation "${operation}" missing`,
        },
        when: JinjaWhenManagementOperationUndefined(operation),
    }
}
