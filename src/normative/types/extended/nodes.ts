import {NodeTypeMap} from '#spec/node-type'
import {MetadataAbstract, MetadataNormative} from '../utils'

const nodes: NodeTypeMap = {
    'nodejs.runtime': {
        derived_from: 'software.runtime',
        metadata: {
            ...MetadataNormative(),
        },
        properties: {
            application_name: {
                type: 'string',
                default: 'nodejs',
            },
        },
        artifacts: {
            apt_package: {
                type: 'apt.package',
                file: 'nodejs',
                properties: {
                    script: 'https://deb.nodesource.com/setup_18.x',
                },
            },
        },
        attributes: {
            management_address: {
                type: 'string',
            },
        },
        capabilities: {
            host: {
                type: 'tosca.capabilities.Compute',
            },
        },
    },
    'nodejs.service.application': {
        derived_from: 'service.application',
        metadata: {
            ...MetadataNormative(),
            ...MetadataAbstract(),
        },
        properties: {
            application_language: {
                type: 'string',
                default: 'nodejs18',
            },
        },
        interfaces: {
            management: {
                type: 'management',
                operations: {
                    configure: 'npm ci',
                    start: 'npm start',
                },
            },
        },
    },
    'python.runtime': {
        derived_from: 'software.runtime',
        metadata: {
            ...MetadataNormative(),
        },
        artifacts: {
            apt_package: {
                type: 'apt.package',
                file: 'python-is-python3',
                properties: {
                    dependencies: {
                        type: 'string',
                        default: 'python3 python3-pip python3-venv',
                    },
                },
            },
        },
        attributes: {
            management_address: {
                type: 'string',
            },
        },
        capabilities: {
            host: {
                type: 'tosca.capabilities.Compute',
            },
        },
    },
    'python.service.application': {
        derived_from: 'service.application',
        metadata: {
            ...MetadataNormative(),
            ...MetadataAbstract(),
        },
        properties: {
            application_language: {
                type: 'string',
                default: 'python3',
            },
        },
        interfaces: {
            management: {
                type: 'management',
                operations: {
                    configure: 'pip install -r requirements.txt',
                    start: 'python main.py',
                },
            },
        },
    },
    // TODO: go runtime?
    // TODO: management operations
    'go.service.application': {
        derived_from: 'service.application',
        metadata: {
            ...MetadataNormative(),
            ...MetadataAbstract(),
        },
        properties: {
            application_language: {
                type: 'string',
                default: 'go122',
            },
        },
    },
    'java.runtime': {
        derived_from: 'software.runtime',
        metadata: {
            ...MetadataNormative(),
        },
        properties: {
            application_name: {
                type: 'string',
                default: 'java',
            },
        },
        artifacts: {
            apt_package: {
                type: 'apt.package',
                file: 'openjdk-18-jre-headless',
            },
        },
        attributes: {
            management_address: {
                type: 'string',
            },
        },
        capabilities: {
            host: {
                type: 'tosca.capabilities.Compute',
            },
        },
    },
    // TODO: management operations
    'java.service.application': {
        derived_from: 'service.application',
        metadata: {
            ...MetadataNormative(),
            ...MetadataAbstract(),
        },
        properties: {
            application_language: {
                type: 'string',
                default: 'java21',
            },
        },
    },
    'dotnet.runtime': {
        derived_from: 'software.runtime',
        metadata: {
            ...MetadataNormative(),
        },
        properties: {
            application_name: {
                type: 'string',
                default: 'java',
            },
        },
        artifacts: {
            apt_package: {
                type: 'apt.package',
                file: 'dotnet-sdk-8.0',
            },
        },
        attributes: {
            management_address: {
                type: 'string',
            },
        },
        capabilities: {
            host: {
                type: 'tosca.capabilities.Compute',
            },
        },
    },
    // TODO: management operations
    'csharp.service.application': {
        derived_from: 'service.application',
        metadata: {
            ...MetadataNormative(),
            ...MetadataAbstract(),
        },
        properties: {
            application_language: {
                type: 'string',
                default: 'dotnet8',
            },
        },
    },
    'binary.service.application': {
        derived_from: 'service.application',
        metadata: {
            ...MetadataNormative(),
            ...MetadataAbstract(),
        },
        properties: {
            application_language: {
                type: 'string',
                default: 'binary',
            },
        },
        interfaces: {
            management: {
                type: 'management',
                operations: {
                    start: {get_property: ['SELF', 'application_name']},
                },
            },
        },
    },
    'gcp.provider': {
        derived_from: 'cloud.provider',
        metadata: {
            ...MetadataNormative(),
            ...MetadataAbstract(),
        },
        properties: {
            _hosting: {
                type: 'string',
                default: 'gcp',
            },
            gcp_region: {
                type: 'string',
            },
            gcp_service_account_file: {
                type: 'string',
            },
            gcp_project: {
                type: 'string',
            },
        },
        interfaces: {
            Standard: {
                operations: {
                    create: 'exit 0',
                    delete: 'exit 0',
                },
            },
        },
    },
    'gcp.service': {
        derived_from: 'cloud.service',
        metadata: {
            ...MetadataNormative(),
            ...MetadataAbstract(),
        },
        properties: {
            _hosting: {
                type: 'string',
                default: 'gcp',
            },
            gcp_service: {
                type: 'string',
            },
        },
    },
    'gcp.cloudrun': {
        derived_from: 'gcp.service',
        metadata: {
            ...MetadataNormative(),
        },
        properties: {
            gcp_service: {
                type: 'string',
                default: 'run.googleapis.com',
            },
        },
    },
    'gcp.cloudsql': {
        derived_from: 'gcp.service',
        metadata: {
            ...MetadataNormative(),
        },
        properties: {
            gcp_service: {
                type: 'string',
                default: 'sqladmin.googleapis.com',
            },
        },
    },
    'gcp.appengine': {
        derived_from: 'gcp.service',
        metadata: {
            ...MetadataNormative(),
        },
        properties: {
            gcp_service: {
                type: 'string',
                default: 'appengine.googleapis.com',
            },
        },
        requirements: [
            {
                build: {
                    capability: 'tosca.capabilities.Root',
                    relationship: 'tosca.relationships.DependsOn',
                },
            },
            {
                reporting: {
                    capability: 'tosca.capabilities.Root',
                    relationship: 'tosca.relationships.DependsOn',
                },
            },
        ],
    },
    'gcp.appenginereporting': {
        derived_from: 'gcp.service',
        metadata: {
            ...MetadataNormative(),
        },
        properties: {
            gcp_service: {
                type: 'string',
                default: 'appenginereporting.googleapis.com',
            },
        },
    },
    'gcp.cloudbuild': {
        derived_from: 'gcp.service',
        metadata: {
            ...MetadataNormative(),
        },
        properties: {
            gcp_service: {
                type: 'string',
                default: 'cloudbuild.googleapis.com',
            },
        },
    },
    'docker.engine': {
        derived_from: 'container.runtime',
        metadata: {
            ...MetadataNormative(),
        },
        properties: {
            application_name: {
                type: 'string',
                default: 'docker',
            },
            _hosting: {
                type: 'string',
                default: 'docker',
            },
        },
        attributes: {
            management_address: {
                type: 'string',
            },
        },
        capabilities: {
            host: {
                type: 'tosca.capabilities.Compute',
            },
        },
    },
    'kubernetes.cluster': {
        derived_from: 'cloud.service',
        metadata: {
            ...MetadataNormative(),
            ...MetadataAbstract(),
        },
        properties: {
            _hosting: {
                type: 'string',
                default: 'kubernetes',
            },
            k8s_host: {
                type: 'string',
            },
            k8s_ca_cert_file: {
                type: 'string',
            },
            k8s_client_cert_file: {
                type: 'string',
            },
            k8s_client_key_file: {
                type: 'string',
            },
        },
        capabilities: {
            host: {
                type: 'tosca.capabilities.Compute',
            },
        },
        interfaces: {
            Standard: {
                operations: {
                    create: 'exit 0',
                    delete: 'exit 0',
                },
            },
        },
    },
    'openstack.provider': {
        derived_from: 'cloud.provider',
        metadata: {
            ...MetadataNormative(),
            ...MetadataAbstract(),
        },
        properties: {
            _hosting: {
                type: 'string',
                default: 'openstack',
            },
            os_region_name: {
                type: 'string',
            },
            os_auth_type: {
                type: 'string',
            },
            os_auth_url: {
                type: 'string',
            },
            os_identity_api_version: {
                type: 'string',
            },
            os_interface: {
                type: 'string',
            },
            os_application_credential_id: {
                type: 'string',
            },
            os_application_credential_secret: {
                type: 'string',
            },
        },
        interfaces: {
            Standard: {
                operations: {
                    create: 'exit 0',
                    delete: 'exit 0',
                },
            },
        },
    },
    'mysql.dbms': {
        derived_from: 'relational.dbms',
        metadata: {
            ...MetadataNormative(),
        },
        properties: {
            dbms_name: {
                type: 'string',
            },
            application_name: {
                type: 'string',
            },
            dbms_version: {
                type: 'string',
                default: '5.7',
            },
            dbms_password: {
                type: 'string',
            },
            dbms_ssl_mode: {
                type: 'string',
                default: 'None',
            },
        },
        attributes: {
            application_address: {
                type: 'string',
            },
            application_port: {
                type: 'string',
            },
            management_address: {
                type: 'string',
            },
            management_port: {
                type: 'string',
            },
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
    'mysql.database': {
        derived_from: 'relational.database',
        metadata: {
            ...MetadataNormative(),
        },
        properties: {
            database_name: {
                type: 'string',
            },
            database_user: {
                type: 'string',
            },
            database_password: {
                type: 'string',
            },
        },
        attributes: {
            application_address: {
                type: 'string',
            },
            application_port: {
                type: 'string',
            },
        },
        capabilities: {
            database: {
                type: 'tosca.capabilities.Endpoint.Database',
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
}

export default nodes
