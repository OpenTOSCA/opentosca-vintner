import * as assert from '#assert'
import {MANAGEMENT_OPERATIONS} from '#spec/interface-definition'
import {NodeType, PropertyDefinition} from '#spec/node-type'
import {UnexpectedError} from '#utils/error'
import {METADATA, PROPERTIES} from './types'

// TODO: next: consider inherited types
export function mapProperties(
    type: NodeType,
    options: {quote?: boolean; format?: 'map' | 'list' | 'env'; ignore?: string[]} = {}
) {
    options.quote = options.quote ?? true
    options.format = options.format ?? 'list'
    options.ignore = options.ignore ?? []

    const list = Object.entries(type.properties || {})
        .filter(([propertyName, propertyDefinition]) => {
            const metadata = propertyDefinition.metadata || {}
            const ignore = metadata[METADATA.VINTNER_IGNORE]
            return !(ignore === true || ignore === 'true')
        })
        .map(([propertyName, propertyDefinition]) => {
            const metadata = propertyDefinition.metadata || {}

            const name = metadata[METADATA.VINTNER_NAME] ?? propertyName.toUpperCase()
            assert.isString(name)

            const value = options.quote ? `"{{ SELF.${propertyName} }}"` : `{{ SELF.${propertyName} }}`

            return {
                name,
                value,
            }
        })
        .filter(it => !options.ignore!.includes(it.name))

    if (options.format === 'list') return list

    if (options.format === 'map')
        return list.reduce<{
            [key: string]: string
        }>((env, it) => {
            env[it.name] = it.value
            return env
        }, {})

    // TODO: use files.toENV
    if (options.format === 'env') return list.map(it => `${it.name}=${it.value}`)

    throw new UnexpectedError()
}

export function SecureApplicationProtocolPropertyDefinition(type: NodeType): {[key: string]: PropertyDefinition} {
    // TODO: enable assert but currently this breaks software application implementation generation
    // assert.isDefined(type.properties)

    if (!type.properties) return {}
    if (!type.properties[PROPERTIES.APPLICATION_PROTOCOL]) return {}

    const definition = type.properties[PROPERTIES.APPLICATION_PROTOCOL]
    assert.isDefined(definition)
    assert.isDefined(definition.default)
    assert.isString(definition.default)

    return {
        [PROPERTIES.APPLICATION_PROTOCOL]: {
            type: 'string',
            default: `${definition.default}s`,
        },
    }
}

// TODO: fix this hotfix
export const HOTFIX_SECURE_PROTOCOL_FILTER = 'regex_replace("^(.*[^s])$", "\\\\1s")'

export function MetadataGenerated() {
    return {[METADATA.VINTNER_GENERATED]: 'true'}
}

export function MetadataUnfurl() {
    return {[METADATA.VINTNER_ORCHESTRATOR]: 'unfurl'}
}

export function OpenstackMachineCredentials() {
    return {
        os_ssh_user: {
            type: 'string',
            default: {
                get_input: 'os_ssh_user',
            },
        },
        os_ssh_key_file: {
            type: 'string',
            default: {
                get_input: 'os_ssh_key_file',
            },
        },
    }
}

export function OpenstackMachineHost() {
    return {
        os_ssh_host: {
            type: 'string',
            default: {
                eval: '.::.requirements::[.name=host]::.target::management_address',
            },
        },
    }
}

export function OpenstackProviderCredentials() {
    return {
        os_region_name: {
            type: 'string',
            default: {
                get_input: 'os_region_name',
            },
        },
        os_auth_type: {
            type: 'string',
            default: {
                get_input: 'os_auth_type',
            },
        },
        os_auth_url: {
            type: 'string',
            default: {
                get_input: 'os_auth_url',
            },
        },
        os_identity_api_version: {
            type: 'string',
            default: {
                get_input: 'os_identity_api_version',
            },
        },
        os_interface: {
            type: 'string',
            default: {
                get_input: 'os_interface',
            },
        },
        os_application_credential_id: {
            type: 'string',
            default: {
                get_input: 'os_application_credential_id',
            },
        },
        os_application_credential_secret: {
            type: 'string',
            default: {
                get_input: 'os_application_credential_secret',
            },
        },
    }
}

export function GCPProviderCredentials() {
    return {
        gcp_service_account_file: {
            type: 'string',
            default: {
                get_input: 'gcp_service_account_file',
            },
        },
        gcp_region: {
            type: 'string',
            default: {
                get_input: 'gcp_region',
            },
        },
        gcp_project: {
            type: 'string',
            default: {
                get_input: 'gcp_project',
            },
        },
    }
}

export function KubernetesCredentials() {
    return {
        k8s_host: {
            type: 'string',
            default: {
                get_input: 'k8s_host',
            },
        },
        k8s_ca_cert_file: {
            type: 'string',
            default: {
                get_input: 'k8s_ca_cert_file',
            },
        },
        k8s_client_cert_file: {
            type: 'string',
            default: {
                get_input: 'k8s_client_cert_file',
            },
        },
        k8s_client_key_file: {
            type: 'string',
            default: {
                get_input: 'k8s_client_key_file',
            },
        },
    }
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

export function AnsibleHostOperationPlaybookArgs() {
    return ['--become', '--key-file={{ SELF.os_ssh_key_file }}', '--user={{ SELF.os_ssh_user }}']
}

export function AnsibleWaitForSSHTask() {
    return {
        name: 'wait for ssh',
        wait_for_connection: null,
    }
}

export function TerraformStandardOperations() {
    return {
        Standard: {
            operations: {
                configure: {
                    implementation: {
                        primary: 'Terraform',
                    },
                },
                delete: {
                    implementation: {
                        primary: 'Terraform',
                    },
                },
            },
        },
    }
}

export function ZipArchiveFile() {
    return `{{ "project" | get_dir }}/ensemble/{{  ".artifacts::zip_archive::file" | eval }}`
}

export function ZipArchiveUrl() {
    return `{{  ".artifacts::zip_archive::file" | eval }}`
}

export function TarArchiveFile() {
    return `{{ "project" | get_dir }}/ensemble/{{  ".artifacts::tar_archive::file" | eval }}`
}

export function TarArchiveUrl() {
    return `{{ ".artifacts::tar_archive::file" | eval }}`
}

export function ApplicationDirectory() {
    return {
        application_directory: {
            type: 'string',
            default: {concat: ['/var/lib/', {get_property: ['SELF', 'application_name']}]},
        },
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

export function BashCreateApplicationDirectory() {
    return `mkdir -p {{ SELF.application_directory }}`
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

export function BashDeleteApplicationDirectory() {
    return `rm -rf "{{ SELF.application_directory }}"`
}

export function AnsibleUnarchiveZipArchiveFileTask() {
    const type = 'zip.archive'
    return {
        name: 'extract deployment artifact in application directory',
        'ansible.builtin.unarchive': {
            src: ZipArchiveFile(),
            dest: '{{ SELF.application_directory }}',
            extra_opts: SourceArchiveExtraOpts(type),
        },
        when: JinjaWhenSourceArchiveFile(type),
    }
}

// TODO: this
export function BashUnarchiveZipArchiveFile(name: string) {
    return `
echo "Not implemented"
exit 1
`.trim()
}

export function SourceArchiveExtraOpts(type: string) {
    return `{{ ".artifacts::${SourceArchiveName(type)}::extra_opts" | eval | map_value }}`
}

export function AnsibleUnarchiveZipArchiveUrlTask() {
    const type = 'zip.archive'
    return {
        name: 'extract deployment artifact in application directory',
        'ansible.builtin.unarchive': {
            src: ZipArchiveUrl(),
            dest: '{{ SELF.application_directory }}',
            remote_src: 'yes',
            extra_opts: SourceArchiveExtraOpts(type),
        },
        when: JinjaWhenSourceArchiveUrl(type),
    }
}

export function AnsibleUnarchiveTarArchiveFileTask() {
    const type = 'tar.archive'
    return {
        name: 'extract deployment artifact from file in application directory',
        'ansible.builtin.unarchive': {
            src: TarArchiveFile(),
            dest: '{{ SELF.application_directory }}',
            extra_opts: SourceArchiveExtraOpts(type),
        },
        when: JinjaWhenSourceArchiveFile(type),
    }
}

export function BashUnarchiveTarArchiveFile(name: string) {
    return `tar -xzf /tmp/artifact-${name} -C {{ SELF.application_directory }} ${SourceArchiveExtraOpts('tar.archive')}`
}

export function AnsibleUnarchiveTarArchiveUrlTask() {
    const type = 'tar.archive'
    return {
        name: 'extract deployment artifact from URL in application directory',
        'ansible.builtin.unarchive': {
            src: TarArchiveUrl(),
            dest: '{{ SELF.application_directory }}',
            remote_src: 'yes',
            extra_opts: SourceArchiveExtraOpts(type),
        },
        when: JinjaWhenSourceArchiveUrl(type),
    }
}

export function JinjaWhenSourceArchiveFile(type: string) {
    return `not (".artifacts::${SourceArchiveName(type)}::file" | eval).startswith("http")`
}

export function JinjaWhenSourceArchiveUrl(type: string) {
    return `(".artifacts::${SourceArchiveName(type)}::file" | eval).startswith("http")`
}

export function BashWhenSourceArchiveUrl(type: string) {
    return `"{{ ".artifacts::${SourceArchiveName(type)}::file" | eval }}" == http*`
}

export function BashDownloadTarArchive(name: string) {
    return `
if [[ ${BashWhenSourceArchiveUrl('tar.archive')} ]]; then 
    wget -O /tmp/artifact-${name} ${TarArchiveUrl()} 
fi
`.trim()
}

export function SourceArchiveName(type: string) {
    return type.replaceAll('.', '_')
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

export function BashCreateVintnerDirectory() {
    return `mkdir -p {{ SELF.application_directory }}/.vintner`
}

export function ApplicationEnvironment(type: NodeType) {
    const env = mapProperties(type, {format: 'env'})
    assert.isArray(env)
    return env.join(`\n`) + '\n'
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

export function BashCreateApplicationEnvironment(type: NodeType) {
    return `
cat <<EOF > {{ SELF.application_directory }}/.env
${ApplicationEnvironment(type)}
EOF>>
`.trim()
}

export function AnsibleAssertOperationTask(operation: MANAGEMENT_OPERATIONS) {
    return {
        name: 'assert management operation',
        'ansible.builtin.fail': {
            dest: `Management operation "${operation}" missing`,
        },
        when: JinjaWhenOperationUndefined(operation),
    }
}

export function BashAssertOperation(operation: MANAGEMENT_OPERATIONS) {
    return `
if [[ ${BashWhenOperationUndefined(operation)} ]]; then
    echo 'Management operation "${operation}" missing'
    exit 1 
fi
`.trim()
}

// TODO: support that operation is a path to a file, e.g., via artifact types ... (or even inline Ansible or Terraform)
export function AnsibleCopyOperationTask(operation: MANAGEMENT_OPERATIONS) {
    return {
        name: 'copy management operation',
        'ansible.builtin.copy': {
            dest: `{{ SELF.application_directory }}/.vintner/${operation}.sh`,
            content: Operation(operation),
            mode: '0755',
        },
        when: JinjaWhenOperationDefined(operation),
    }
}

export function AnsibleCallOperationTask(operation: MANAGEMENT_OPERATIONS) {
    return {
        name: 'call management operation',
        'ansible.builtin.shell': `. .env && . .vintner/${operation}.sh`,
        args: {
            chdir: '{{ SELF.application_directory }}',
            executable: '/bin/bash',
        },
        when: JinjaWhenOperationDefined(operation),
    }
}

export function BashCopyOperation(operation: MANAGEMENT_OPERATIONS) {
    return `
cat <<EOF > {{ SELF.application_directory }}/.vintner/${operation}.sh
${Operation(operation)}
EOF>>
chmod +x {{ SELF.application_directory }}/.vintner/${operation}.sh
`.trim()
}

export function BashCallOperation(operation: MANAGEMENT_OPERATIONS) {
    return `
cd {{ SELF.application_directory }}
. .env
. .vintner/${operation}.sh
`.trim()
}

export function Operation(operation: MANAGEMENT_OPERATIONS) {
    return `
#! /usr/bin/bash
set -e

{{ (${SelfOperation(operation)} == "${VINTNER_MANAGEMENT_OPERATION_UNDEFINED}" ) | ternary("echo 0", foo) }}
`.trimStart()
}

export function JinjaWhenOperationDefined(operation: MANAGEMENT_OPERATIONS) {
    return `${SelfOperation(operation)} != "${VINTNER_MANAGEMENT_OPERATION_UNDEFINED}"`
}

export function JinjaWhenOperationUndefined(operation: MANAGEMENT_OPERATIONS) {
    return `${SelfOperation(operation)} == "${VINTNER_MANAGEMENT_OPERATION_UNDEFINED}"`
}

export function BashWhenOperationDefined(operation: MANAGEMENT_OPERATIONS) {
    return `"{{ ${SelfOperation(operation)} | split('\n') | first }}" != "${VINTNER_MANAGEMENT_OPERATION_UNDEFINED}"`
}

export function BashWhenOperationUndefined(operation: MANAGEMENT_OPERATIONS) {
    return `"{{ ${SelfOperation(operation)} | split('\n') | first }}" == "${VINTNER_MANAGEMENT_OPERATION_UNDEFINED}"`
}

export function SelfOperation(operation: MANAGEMENT_OPERATIONS) {
    return `SELF._management_${operation}`
}

export const BASH_HEADER = `
#!/usr/bin/env bash
set -e
`.trim()

export const VINTNER_MANAGEMENT_OPERATION_UNDEFINED = 'VINTNER_MANAGEMENT_OPERATION_UNDEFINED'
