import {METADATA} from '#technologies/plugins/rules/types'

export function UnfurlSSHEndpointCapability() {
    return {
        endpoint: {
            type: 'unfurl.capabilities.Endpoint.Ansible',
            properties: {
                connection: 'ssh',
                host: {
                    eval: '.parent::management_address',
                },
            },
        },
    }
}

export function MetadataUnfurl() {
    return {[METADATA.VINTNER_ORCHESTRATOR]: 'unfurl'}
}
