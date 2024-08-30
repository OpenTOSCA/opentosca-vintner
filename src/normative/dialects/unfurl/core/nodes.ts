import {UnfurlSSHEndpointCapability} from '#normative/dialects/unfurl/utils'
import {MetadataIgnore} from '#normative/types/utils'
import {NodeTypeMap} from '#spec/node-type'
import {RecursivePartial} from '#utils/types'

const nodes: RecursivePartial<NodeTypeMap> = {
    'software.application': {
        properties: {
            _management_create: {
                type: 'string',
                metadata: {
                    ...MetadataIgnore(),
                },
                default: {
                    eval: {
                        python: '{{ "project" | get_dir }}/vintner_utils.py#get_operation',
                        args: ['management', 'create'],
                    },
                },
            },
            _management_configure: {
                type: 'string',
                metadata: {
                    ...MetadataIgnore(),
                },
                default: {
                    eval: {
                        python: '{{ "project" | get_dir }}/vintner_utils.py#get_operation',
                        args: ['management', 'configure'],
                    },
                },
            },
            _management_start: {
                type: 'string',
                metadata: {
                    ...MetadataIgnore(),
                },
                default: {
                    eval: {
                        python: '{{ "project" | get_dir }}/vintner_utils.py#get_operation',
                        args: ['management', 'start'],
                    },
                },
            },
            _management_stop: {
                type: 'string',
                metadata: {
                    ...MetadataIgnore(),
                },
                default: {
                    eval: {
                        python: '{{ "project" | get_dir }}/vintner_utils.py#get_operation',
                        args: ['management', 'stop'],
                    },
                },
            },
            _management_delete: {
                type: 'string',
                metadata: {
                    ...MetadataIgnore(),
                },
                default: {
                    eval: {
                        python: '{{ "project" | get_dir }}/vintner_utils.py#get_operation',
                        args: ['management', 'delete'],
                    },
                },
            },
        },
    },
    'service.application': {
        attributes: {
            application_endpoint: {
                default: {
                    concat: [
                        {
                            eval: '.::application_protocol',
                        },
                        '://',
                        {
                            eval: '.::application_address',
                        },
                        ':',
                        {
                            eval: '.::application_port',
                        },
                    ],
                },
            },
        },
    },
    'virtual.machine': {
        capabilities: {
            ...UnfurlSSHEndpointCapability(),
        },
        attributes: {
            application_address: {
                default: {
                    eval: '.::management_address',
                },
            },
        },
    },
    ingress: {
        properties: {
            application_name: {
                default: {
                    eval: '.::.requirements::[.name=application]::.target::application_name',
                },
            },
            application_port: {
                default: {
                    eval: '.::.requirements::[.name=application]::.target::application_port',
                },
            },
            application_protocol: {
                default: {
                    eval: '.::.requirements::[.name=application]::.target::application_protocol',
                },
            },
        },
    },
}

export default nodes
