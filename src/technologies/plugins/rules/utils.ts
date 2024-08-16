import * as assert from '#assert'
import {NodeType, PropertyDefinition} from '#spec/node-type'
import {UnexpectedError} from '#utils/error'
import {METADATA, PROPERTIES} from './types'

// TODO: does not consider inherited types

export function mapProperties(
    type: NodeType,
    options: {quote?: boolean; format?: 'map' | 'list' | 'ini'; ignore?: string[]} = {}
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

    if (options.format === 'ini') return list.map(it => `${it.name}=${it.value}`)

    throw new UnexpectedError()
}

export function SecureApplicationProtocolPropertyDefinition(type: NodeType): {[key: string]: PropertyDefinition} {
    assert.isDefined(type.properties)

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
