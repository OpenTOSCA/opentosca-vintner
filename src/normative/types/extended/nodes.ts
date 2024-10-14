import {NodeTypeMap} from '#spec/node-type'
import {METADATA} from '#technologies/plugins/rules/types'
import {MetadataAbstract, MetadataNormative} from '../utils'

const nodes: NodeTypeMap = {
    'nodejs.runtime': {
        derived_from: 'software.runtime',
        description:
            'The "nodejs.runtime" node type manages the Node.js runtime, which is a software runtime that runs on a machine. It is capable of hosting Node.js components',
        metadata: {
            ...MetadataNormative(),
        },
        properties: {
            application_name: {
                type: 'string',
                default: 'nodejs',
                description: 'the name of the application',
            },
        },
        artifacts: {
            apt_package: {
                type: 'apt.package',
                description: 'the apt package to install Node.js',
                file: 'nodejs',
                properties: {
                    script: 'https://deb.nodesource.com/setup_18.x',
                },
            },
        },
        attributes: {
            management_address: {
                type: 'string',
                description: 'the management address of the host',
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
        description: 'The "nodejs.service.application" node type manages a Node.js service application.',
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
    'reactjs.service.application': {
        derived_from: 'service.application',
        description: 'The "reactjs.service.application" node type manages a React.js service application.',
        metadata: {
            ...MetadataNormative(),
            ...MetadataAbstract(),
        },
        properties: {
            // TODO: which language?!
            application_language: {
                type: 'string',
                default: 'nodejs18',
            },
        },
    },
    'python.runtime': {
        derived_from: 'software.runtime',
        description:
            'The "python.runtime" node type manages the Python runtime, which is a software runtime that runs on a machine. It is capable of hosting Python components.',
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
                description: 'the management address of the host',
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
        description: 'The "python.service.application" node type manages a Python service application.',
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
        description: 'The "go.service.application" node type manages a Go service application.',
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
        description:
            'The "java.runtime" node type manages the Java runtime, which is a software runtime that runs on a machine. It is capable of hosting Java components.',
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
                description: 'the management address of the host',
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
        description: 'The "java.service.application" node type manages a Java service application.',
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
        description:
            'The "dotnet.runtime" node type manages the .NET runtime, which is a software runtime that runs on a machine. It is capable of hosting .NET components.',
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
                description: 'the management address of the host',
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
        description: 'The "csharp.service.application" node type manages a C# service application.',
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
        description: 'The "binary.service.application" node type manages a binary service application.',
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
    },
    'gcp.provider': {
        derived_from: 'cloud.provider',
        description: 'The abstract "gcp.provider" node type defines a Google Cloud Platform (GCP) project.',
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
                description: 'the region of the GCP project',
            },
            gcp_service_account_file: {
                type: 'string',
                description:
                    'the service account file of the GCP project, i.e., the absolute path to the serivce account file on the filesystem of the orchestrator',
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
        description: 'The abstract "gcp.service" node type defines a Google Cloud Platform (GCP) service.',
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
                description: 'the API of the GCP service',
            },
        },
    },
    'gcp.cloudrun': {
        derived_from: 'gcp.service',
        description: 'The "gcp.cloudrun" node type manages a the GCP CloudRun service.',
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
        description: 'The "gcp.cloudsql" node type manages a the GCP CloudSQL service.',
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
        description: 'The "gcp.appengine" node type manages a the GCP AppEngine service.',
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
        description: 'The "gcp.appenginereporting" node type manages a the GCP AppEngine Reporting service.',
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
        description: 'The "gcp.cloudbuild" node type manages a the GCP CloudBuild service.',
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
    'gcp.kubernetesengine': {
        derived_from: 'gcp.service',
        description: 'The "gcp.kubernetesengine" node type manages a the GCP Kubernetes Engine service.',
        metadata: {
            ...MetadataNormative(),
        },
        properties: {
            gcp_service: {
                type: 'string',
                default: 'container.googleapis.com',
            },
        },
    },
    'gcp.cloudstorage': {
        derived_from: 'gcp.service',
        description: 'The "gcp.cloudstorage" node type manages a the GCP CloudStorage service.',
        metadata: {
            ...MetadataNormative(),
        },
        properties: {
            gcp_service: {
                type: 'string',
                default: 'storage.googleapis.com',
            },
        },
        attributes: {
            storage_dialect: {
                type: 'string',
                default: 'gcp',
            },
        },
    },
    'gcp.memorystore': {
        derived_from: 'gcp.service',
        description: 'The "gcp.memorystore" node type manages a the GCP Memorystore service.',
        metadata: {
            ...MetadataNormative(),
        },
        properties: {
            gcp_service: {
                type: 'string',
                default: 'redis.googleapis.com',
            },
        },
    },
    'docker.engine': {
        derived_from: 'container.runtime',
        description:
            'The "docker.engine" node type manages the Docker Engine, which is a software runtime that runs on a machine. It is capable of hosting Docker containers. It is configured to listen on the unix socket as well as on tcp://0.0.0.0:2375.',
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
                description: 'the management address of the host',
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
        description:
            'The abstract "kubernetes.cluster" node type describes a Kubernetes cluster. It is typically hosted on a cloud provider.',
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
                description: 'the host of the Kubernetes API',
            },
            k8s_ca_cert_file: {
                type: 'string',
                description: 'the CA certificate file of the Kubernetes API',
            },
            k8s_client_cert_file: {
                type: 'string',
                description: 'the client certificate file to connect to the Kubernetes API',
            },
            k8s_client_key_file: {
                type: 'string',
                description: 'the client key file to connect to the Kubernetes API',
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
        description: 'The abstract "openstack.provider" node type defines an OpenStack project.',
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
                description: 'the region of the OpenStack project',
            },
            os_auth_type: {
                type: 'string',
                description: 'the authentication type of the OpenStack project',
            },
            os_auth_url: {
                type: 'string',
                description: 'the authentication URL of the OpenStack project',
            },
            os_identity_api_version: {
                type: 'string',
                description: 'the identity API version of the OpenStack project',
            },
            os_interface: {
                type: 'string',
                description: 'the interface of the OpenStack project',
            },
            os_application_credential_id: {
                type: 'string',
                description: 'the application credential ID to authenticate at the OpenStack project',
            },
            os_application_credential_secret: {
                type: 'string',
                description: 'the application credential secret to authenticate at the OpenStack project',
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
    'minio.server': {
        derived_from: 'service.application',
        metadata: {
            ...MetadataNormative(),
        },
        properties: {
            access_key: {
                type: 'string',
                metadata: {
                    [METADATA.VINTNER_NAME]: 'MINIO_ROOT_USER',
                },
            },
            secret_key: {
                type: 'string',
                metadata: {
                    [METADATA.VINTNER_NAME]: 'MINIO_ROOT_PASSWORD',
                },
            },
        },
        attributes: {
            storage_dialect: {
                type: 'string',
                default: 'minio',
            },
        },
    },
    'redis.server': {
        derived_from: 'cache',
        metadata: {
            ...MetadataNormative(),
        },
        properties: {
            application_protocol: {
                type: 'string',
                default: 'redis',
            },
        },
    },
}

export default nodes
