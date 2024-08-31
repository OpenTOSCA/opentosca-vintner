import {UnfurlSSHEndpointCapability} from '#normative/dialects/unfurl/utils'
import {NodeTypeMap} from '#spec/node-type'
import {RecursivePartial} from '#utils/types'

const nodes: RecursivePartial<NodeTypeMap> = {
    'nodejs.runtime': {
        attributes: {
            management_address: {
                default: {
                    eval: '.::.requirements::[.name=host]::.target::management_address',
                },
            },
        },
        capabilities: {
            ...UnfurlSSHEndpointCapability(),
        },
    },
    'python.runtime': {
        attributes: {
            management_address: {
                default: {
                    eval: '.::.requirements::[.name=host]::.target::management_address',
                },
            },
        },
        capabilities: {
            ...UnfurlSSHEndpointCapability(),
        },
    },
    'java.runtime': {
        attributes: {
            management_address: {
                default: {
                    eval: '.::.requirements::[.name=host]::.target::management_address',
                },
            },
        },
        capabilities: {
            ...UnfurlSSHEndpointCapability(),
        },
    },
    'dotnet.runtime': {
        attributes: {
            management_address: {
                default: {
                    eval: '.::.requirements::[.name=host]::.target::management_address',
                },
            },
        },
        capabilities: {
            ...UnfurlSSHEndpointCapability(),
        },
    },
    'binary.service.application': {
        interfaces: {
            management: {
                type: 'management',
                operations: {
                    start: './{{ SELF.application_name }}',
                },
            },
        },
    },
    'gcp.service': {
        properties: {
            gcp_service: {
                default: 'must-be-overridden',
            },
        },
    },
    'docker.engine': {
        attributes: {
            management_address: {
                default: {
                    eval: '.::.requirements::[.name=host]::.target::management_address',
                },
            },
        },
        capabilities: {
            ...UnfurlSSHEndpointCapability(),
        },
    },
    'mysql.dbms': {
        properties: {
            application_name: {
                default: {
                    eval: '.::dbms_name',
                },
            },
        },
    },
    'mysql.database': {
        attributes: {
            application_address: {
                default: {
                    eval: '.::.requirements::[.name=host]::.target::application_address',
                },
            },
            application_port: {
                default: {
                    eval: '.::.requirements::[.name=host]::.target::application_port',
                },
            },
        },
    },
}

export default nodes
