import {NodeTypeMap} from '#spec/node-type'
import {MetadataAbstract, MetadataIgnore, MetadataName, MetadataNormative} from '../utils'

const nodes: NodeTypeMap = {
    node: {
        derived_from: 'tosca.nodes.Root',
        metadata: {
            ...MetadataNormative(),
            ...MetadataAbstract(),
        },
    },
    'cloud.provider': {
        derived_from: 'node',
        metadata: {
            ...MetadataNormative(),
            ...MetadataAbstract(),
        },
        capabilities: {
            host: {
                type: 'tosca.capabilities.Compute',
            },
        },
    },
    'cloud.service': {
        derived_from: 'node',
        metadata: {
            ...MetadataNormative(),
            ...MetadataAbstract(),
        },
        capabilities: {
            host: {
                type: 'tosca.capabilities.Compute',
            },
        },
        requirements: [
            {
                host: {
                    capability: 'tosca.capabilities.Compute',
                    relationship: 'tosca.relationships.HostedOn',
                },
            },
        ],
    },
    'software.application': {
        derived_from: 'node',
        metadata: {
            ...MetadataNormative(),
            ...MetadataAbstract(),
        },
        properties: {
            application_name: {
                type: 'string',
            },
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
        requirements: [
            {
                host: {
                    capability: 'tosca.capabilities.Compute',
                    relationship: 'tosca.relationships.HostedOn',
                },
            },
        ],
        interfaces: {
            management: {
                type: 'management',
            },
        },
    },
    'service.application': {
        derived_from: 'software.application',
        metadata: {
            ...MetadataNormative(),
            ...MetadataAbstract(),
        },
        properties: {
            application_language: {
                type: 'string',
            },
            application_port: {
                type: 'string',
                metadata: {
                    ...MetadataName('PORT'),
                },
            },
            application_protocol: {
                type: 'string',
            },
        },
        attributes: {
            application_address: {
                type: 'string',
            },
            application_endpoint: {
                type: 'string',
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
    'software.runtime': {
        derived_from: 'software.application',
        metadata: {
            ...MetadataNormative(),
            ...MetadataAbstract(),
        },
        capabilities: {
            host: {
                type: 'tosca.capabilities.Compute',
            },
        },
    },
    'container.runtime': {
        derived_from: 'software.runtime',
        metadata: {
            ...MetadataNormative(),
            ...MetadataAbstract(),
        },
    },
    'virtual.machine': {
        derived_from: 'node',
        metadata: {
            ...MetadataNormative(),
        },
        properties: {
            machine_name: {
                type: 'string',
            },
            ports: {
                type: 'list',
                entry_schema: {
                    type: 'integer',
                },
            },
            flavor: {
                type: 'string',
                default: 'm1.medium',
            },
            network: {
                type: 'string',
            },
            ssh_user: {
                type: 'string',
            },
            ssh_key_name: {
                type: 'string',
            },
            ssh_key_file: {
                type: 'string',
            },
        },
        attributes: {
            management_address: {
                type: 'string',
            },
            application_address: {
                type: 'string',
                default: {
                    eval: '.::management_address',
                },
            },
        },
        capabilities: {
            host: {
                type: 'tosca.capabilities.Compute',
            },
            endpoint: {
                type: 'unfurl.capabilities.Endpoint.Ansible',
                properties: {
                    connection: 'ssh',
                    host: {
                        eval: '.parent::management_address',
                    },
                },
            },
        },
    },
    database: {
        derived_from: 'node',
        metadata: {
            ...MetadataNormative(),
            ...MetadataAbstract(),
        },
    },
    'relational.database': {
        derived_from: 'database',
        metadata: {
            ...MetadataNormative(),
            ...MetadataAbstract(),
        },
    },
    dbms: {
        derived_from: 'node',
        metadata: {
            ...MetadataNormative(),
            ...MetadataAbstract(),
        },
    },
    'relational.dbms': {
        derived_from: 'dbms',
        metadata: {
            ...MetadataNormative(),
            ...MetadataAbstract(),
        },
    },
    ingress: {
        derived_from: 'node',
        metadata: {
            ...MetadataNormative(),
        },
        properties: {
            application_name: {
                type: 'string',
                default: {
                    eval: '.::.requirements::[.name=application]::.target::application_name',
                },
            },
            application_port: {
                type: 'string',
                default: {
                    eval: '.::.requirements::[.name=application]::.target::application_port',
                },
            },
            application_protocol: {
                type: 'string',
                default: {
                    eval: '.::.requirements::[.name=application]::.target::application_protocol',
                },
            },
        },
        attributes: {
            application_address: {
                type: 'string',
            },
        },
        requirements: [
            {
                application: {
                    capability: 'tosca.capabilities.Endpoint',
                    relationship: 'tosca.relationships.ConnectsTo',
                },
            },
            {
                host: {
                    capability: 'tosca.capabilities.Compute',
                    relationship: 'tosca.relationships.HostedOn',
                },
            },
        ],
    },
}

export default nodes
