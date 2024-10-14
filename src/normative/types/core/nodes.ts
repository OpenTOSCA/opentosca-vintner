import {NodeTypeMap} from '#spec/node-type'
import {MetadataAbstract, MetadataName, MetadataNormative} from '../utils'

const nodes: NodeTypeMap = {
    node: {
        derived_from: 'tosca.nodes.Root',
        description: 'The abstract "node" node type defines the root node type all other node types inherit from.',
        metadata: {
            ...MetadataNormative(),
            ...MetadataAbstract(),
        },
    },
    'cloud.provider': {
        derived_from: 'node',
        description:
            'The abstract "cloud.provider" node type defines an abstract cloud provider, which is capable of hosting cloud services.',
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
        description:
            'The abstract "cloud.service" node type defines an generic cloud service, which is hosted on a cloud provider and which is hosting an instance of a cloud service offering.',
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
        description:
            'The abstract "software.application" node type defines a generic software application. It requires a hosting and its lifecycle is managed by the management interface.',
        metadata: {
            ...MetadataNormative(),
            ...MetadataAbstract(),
        },
        properties: {
            application_name: {
                type: 'string',
                description: 'name of the application',
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
        description:
            'The abstract "service.application" node type defines a generic software application, which provides a service. It is not normative how this component is implemented. This could be implemented by a Kubernetes Deployment Resource along with a Kubernetes Service Resource on Kubernetes or by a Systemd Service Unit on a virtual machine.',
        metadata: {
            ...MetadataNormative(),
            ...MetadataAbstract(),
        },
        properties: {
            application_language: {
                type: 'string',
                description: 'the programming/ platform language of the application, e.g., node22',
            },
            application_port: {
                type: 'string',
                description: 'the port the application listens on, e.g., 3000',
                metadata: {
                    ...MetadataName('PORT'),
                },
            },
            application_protocol: {
                type: 'string',
                description: 'the protocol the application uses, e.g., http',
            },
        },
        attributes: {
            application_address: {
                type: 'string',
                description: 'the address under which the application can be reached, i.e., the IP or a domain name',
            },
            application_endpoint: {
                type: 'string',
                description:
                    'the endpoint under which the application can be reached, i.e., the protocol, IP and port concatenated',
            },
        },
    },
    'software.runtime': {
        derived_from: 'software.application',
        description: 'The abstract "software.runtime" node type defines a generic software runtime.',
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
        description: 'The abstract "container.runtime" node type defines a generic container runtime.',
        metadata: {
            ...MetadataNormative(),
            ...MetadataAbstract(),
        },
    },
    machine: {
        derived_from: 'node',
        description: 'The abstract "machine" node type defines a generic computing machine.',
        metadata: {
            ...MetadataNormative(),
            ...MetadataAbstract(),
        },
        properties: {
            machine_name: {
                type: 'string',
                description: 'name of the machine',
            },
        },
        attributes: {
            application_address: {
                type: 'string',
                description:
                    'the address under which the machine can be publicly reached, i.e., the IP or a domain name',
            },
            management_address: {
                type: 'string',
                description:
                    'the address under which the machine can be privately reached, i.e., the IP or a domain name',
            },
        },
    },
    'local.machine': {
        derived_from: 'machine',
        description:
            'The "local.machine" node type manages a local machine, i.e., localhost. It is capable of hosting, e.g., software components.',
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
    'remote.machine': {
        derived_from: 'machine',
        description:
            'The "remote.machine" node type manages a remote machine, i.e., a machine that is not localhost. It is capable of hosting, e.g., software components.',
        metadata: {
            ...MetadataNormative(),
        },
        properties: {
            machine_name: {
                type: 'string',
                description: 'name of the machine',
            },
            ports: {
                type: 'list',
                description: 'ports to open',
                entry_schema: {
                    type: 'string',
                },
            },
            flavor: {
                type: 'string',
                description: 'flavor of the machine, i.e., cpu, memory, disk size encoded as string',
                default: 'm1.medium',
            },
            network: {
                type: 'string',
                description: 'network to connect to',
            },
            ssh_user: {
                type: 'string',
                description: 'ssh user to connect to the machine',
            },
            ssh_key_name: {
                type: 'string',
                description: 'ssh key name to connect to the machine',
            },
            ssh_key_file: {
                type: 'string',
                description:
                    'ssh key file to connect to the machine, i.e., the absolute path to the ssh key file on the filesystem of the orchestrator',
            },
        },
        capabilities: {
            host: {
                type: 'tosca.capabilities.Compute',
            },
        },
    },
    'virtual.machine': {
        derived_from: 'remote.machine',
        description: 'The "virtual.machine" node type manages a virtual machine.',
    },
    'physical.machine': {
        derived_from: 'remote.machine',
        description: 'The "physical.machine" node type manages a physical machine.',
    },
    database: {
        derived_from: 'node',
        description: 'The abstract "database" node type defines a generic database. It requires a DBMS to run.',
        metadata: {
            ...MetadataNormative(),
            ...MetadataAbstract(),
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
    'relational.database': {
        derived_from: 'database',
        description:
            'The abstract "relational.database" node type defines a generic relational database. It requires a relational DBMS to run.',
        metadata: {
            ...MetadataNormative(),
            ...MetadataAbstract(),
        },
    },
    dbms: {
        derived_from: 'software.application',
        description: 'The abstract "dbms" node type defines a generic DBMS.',
        metadata: {
            ...MetadataNormative(),
            ...MetadataAbstract(),
        },
    },
    'relational.dbms': {
        derived_from: 'dbms',
        description: 'The abstract "relational.dbms" node type defines a generic relational DBMS.',
        metadata: {
            ...MetadataNormative(),
            ...MetadataAbstract(),
        },
    },
    cache: {
        derived_from: 'software.application',
        description: 'The abstract "cache" node type defines a generic caching service.',
        properties: {
            cache_name: {
                type: 'string',
                description: 'name of the cache',
            },
            cache_port: {
                type: 'string',
                description: 'port the cache listens on',
            },
        },
        attributes: {
            application_address: {
                type: 'string',
                description: 'the address under which the cache can be reached, i.e., the IP or a domain name',
            },
            application_endpoint: {
                type: 'string',
                description:
                    'the endpoint under which the cache can be reached, i.e., the protocol, IP and port concatenated',
            },
        },
    },
    storage: {
        derived_from: 'node',
        description: 'The abstract "storage" node type defines a generic storage service.',
        metadata: {
            ...MetadataNormative(),
        },
    },
    'block.storage': {
        derived_from: 'storage',
        description: 'The abstract "block.storage" node type defines a generic block storage.',
        metadata: {
            ...MetadataNormative(),
        },
    },
    'object.storage': {
        derived_from: 'storage',
        description: 'The abstract "object.storage" node type defines a generic object storage.',
        metadata: {
            ...MetadataNormative(),
        },
        properties: {
            storage_name: {
                type: 'string',
                description: 'name of the storage',
            },
            storage_dialect: {
                type: 'string',
                description: 'dialect of the storage, e.g., s3',
            },
            storage_user: {
                type: 'string',
            },
            storage_token: {
                type: 'string',
            },
        },
        attributes: {
            storage_endpoint: {
                type: 'string',
            },
            storage_token: {
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
    },
    'file.storage': {
        derived_from: 'storage',
        description: 'The abstract "file.storage" node type defines a generic file storage.',
        metadata: {
            ...MetadataNormative(),
        },
    },
    ingress: {
        derived_from: 'node',
        description:
            'The "ingress" node type manages a generic ingress service, which is a reverse proxy that exposes an upstream application. It is not normative how this component is implemented. This could be implemented by an Ingress resource on Kubernetes or by a reverse proxy, such as NGINX or Caddy, on a virtual machine.',
        metadata: {
            ...MetadataNormative(),
        },
        properties: {
            application_name: {
                type: 'string',
                description: 'name of the upstream application',
            },
            application_port: {
                type: 'string',
                description: 'port the upstream application listens on',
            },
            application_protocol: {
                type: 'string',
                description: 'protocol the upstream application uses',
            },
        },
        attributes: {
            application_address: {
                type: 'string',
                description:
                    'the address under which the upstream application is exposed by the ingress, i.e., the IP or a domain name',
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
