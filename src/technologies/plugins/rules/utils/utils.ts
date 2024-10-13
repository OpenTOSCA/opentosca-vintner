import * as assert from '#assert'
import * as files from '#files'
import {MANAGEMENT_OPERATIONS} from '#spec/interface-definition'
import {NodeType, PropertyDefinition} from '#spec/node-type'
import {METADATA, PROPERTIES} from '#technologies/plugins/rules/types'
import * as utils from '#utils'

// TODO: next: consider inherited types
export function ApplicationProperties(type: NodeType, options: {quote?: boolean; ignore?: string[]} = {}) {
    options.quote = options.quote ?? true
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

    return {
        toList: () => list,
        toMap: () => utils.toMap(list),
        toEnv: () => files.toENV(utils.toMap(list), {quote: false}),
    }
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

export function JinjaSecureApplicationProtocol() {
    return 'SELF.application_protocol if SELF.application_protocol.endswith("s") else SELF.application_protocol + "s"'
}

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

export const BASH_KUBECTL =
    'kubectl --server {{ SELF.k8s_host }} --certificate-authority {{ SELF.k8s_ca_cert_file }} --client-certificate {{ SELF.k8s_client_cert_file }} --client-key {{ SELF.k8s_client_key_file }}'

export function ApplicationDirectory() {
    return {
        application_directory: {
            type: 'string',
            default: {concat: ['/var/lib/', {get_property: ['SELF', 'application_name']}]},
        },
    }
}

export function BashCreateApplicationDirectory() {
    return `mkdir -p {{ SELF.application_directory }}`
}

export function BashDeleteApplicationDirectory() {
    return `rm -rf "{{ SELF.application_directory }}"`
}

export function SourceArchiveFile(type: string) {
    return `{{ "project" | get_dir }}/ensemble/{{ ${ArtifactFile(type)} }}`
}

export function SourceArchiveUrl(type: string) {
    return `{{ ${ArtifactFile(type)} }}`
}

export function SourceArchiveExtraOpts(type: string) {
    return `{{ ".artifacts::*::[.type=${type}]::extra_opts" | eval | map_value }}`
}

export function BashUnarchiveSourceArchiveFile(name: string, type: string) {
    if (type === 'zip.archive') {
        return `unzip /tmp/artifact-${name} -d {{ SELF.application_directory }} ${SourceArchiveExtraOpts(
            'tar.archive'
        )}`
    }

    if (type == 'tar.archive') {
        return `tar -xzf /tmp/artifact-${name} -C {{ SELF.application_directory }} ${SourceArchiveExtraOpts(
            'tar.archive'
        )}`
    }
}

export function JinjaWhenSourceArchiveFile(type: string) {
    return `not (${ArtifactFile(type)}).startswith("http")`
}

export function JinjaWhenSourceArchiveUrl(type: string) {
    return `(${ArtifactFile(type)}).startswith("http")`
}

export function BashWhenSourceArchiveUrl(type: string) {
    return `"{{ ${ArtifactFile(type)} }}" == http*`
}

export function BashDownloadSourceArchive(name: string, type: string) {
    return `
if [[ ${BashWhenSourceArchiveUrl(type)} ]]; then 
    wget -O /tmp/artifact-${name} ${SourceArchiveUrl(type)} 
fi
`.trim()
}

export function ArtifactFile(type: string) {
    return `".artifacts::*::[.type=${type}::file" | eval`
}

export function BashCreateVintnerDirectory() {
    return `mkdir -p {{ SELF.application_directory }}/.vintner`
}

export function ApplicationEnvironment(type: NodeType) {
    return ApplicationProperties(type).toEnv().join(`\n`)
}

export function ApplicationSystemdUnit() {
    return files.toINI({
        Unit: {
            After: 'network.target',
        },
        Service: {
            Type: 'simple',
            ExecStart: `/usr/bin/bash -c ". ./.vintner/${MANAGEMENT_OPERATIONS.START}.sh"`,
            WorkingDirectory: '{{ SELF.application_directory }}',
            EnvironmentFile: '{{ SELF.application_directory }}/.env',
        },
        Install: {
            WantedBy: 'multi-user.target',
        },
    })
}

export function BashCreateApplicationEnvironment(type: NodeType) {
    return `
cat <<EOF > {{ SELF.application_directory }}/.env
${ApplicationEnvironment(type)}
EOF>>
`.trim()
}

export function BashAssertManagementOperation(operation: MANAGEMENT_OPERATIONS) {
    return `
if [[ ${BashWhenManagementOperationUndefined(operation)} ]]; then
    echo 'Management operation "${operation}" missing'
    exit 1 
fi
`.trim()
}

export function BashCopyManagementOperation(operation: MANAGEMENT_OPERATIONS) {
    return `
cat <<EOF > {{ SELF.application_directory }}/.vintner/${operation}.sh
${ManagementOperation(operation)}
EOF>>
chmod +x {{ SELF.application_directory }}/.vintner/${operation}.sh
`.trim()
}

export function BashCallManagementOperation(operation: MANAGEMENT_OPERATIONS) {
    return `
cd {{ SELF.application_directory }}
. .env
. .vintner/${operation}.sh
`.trim()
}

export function ManagementOperation(operation: MANAGEMENT_OPERATIONS) {
    return `${BASH_HEADER}

{{ (${SelfManagementOperation(
        operation
    )} == "${VINTNER_MANAGEMENT_OPERATION_UNDEFINED}" ) | ternary("echo 0", ${SelfManagementOperation(operation)}) }}
`.trim()
}

export function JinjaWhenManagementOperationDefined(operation: MANAGEMENT_OPERATIONS) {
    return `${SelfManagementOperation(operation)} != "${VINTNER_MANAGEMENT_OPERATION_UNDEFINED}"`
}

export function JinjaWhenManagementOperationUndefined(operation: MANAGEMENT_OPERATIONS) {
    return `${SelfManagementOperation(operation)} == "${VINTNER_MANAGEMENT_OPERATION_UNDEFINED}"`
}

export function BashWhenManagementOperationDefined(operation: MANAGEMENT_OPERATIONS) {
    return `"{{ ${SelfManagementOperation(
        operation
    )} | split('\\n') | first }}" != "${VINTNER_MANAGEMENT_OPERATION_UNDEFINED}"`
}

export function BashWhenManagementOperationUndefined(operation: MANAGEMENT_OPERATIONS) {
    return `"{{ ${SelfManagementOperation(
        operation
    )} | split('\\n') | first }}" == "${VINTNER_MANAGEMENT_OPERATION_UNDEFINED}"`
}

export function SelfManagementOperation(operation: MANAGEMENT_OPERATIONS) {
    return `SELF._management_${operation}`
}

export const BASH_HEADER = `
#!/usr/bin/bash
set -e
`.trim()

export const VINTNER_MANAGEMENT_OPERATION_UNDEFINED = 'VINTNER_MANAGEMENT_OPERATION_UNDEFINED'

export const LOCALHOST = '127.0.0.1'
