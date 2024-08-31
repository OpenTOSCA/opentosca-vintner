import {NodeTypeMap} from '#spec/node-type'
import {MetadataAbstract, MetadataName, MetadataNormative} from '../utils'

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
                    type: 'string',
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
            },
        },
        capabilities: {
            host: {
                type: 'tosca.capabilities.Compute',
            },
        },
    },
    'physical.machine': {
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
                    type: 'string',
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
            },
        },
        capabilities: {
            host: {
                type: 'tosca.capabilities.Compute',
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
        derived_from: 'software.application',
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
            },
            application_port: {
                type: 'string',
            },
            application_protocol: {
                type: 'string',
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
