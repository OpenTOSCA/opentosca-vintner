
### Artifact Types

We specify the following normative artifact types.
An overview is given in Figure e1.

<figure markdown>
![Artifact Types](tosca-vintner-profile-extended.artifact-types.svg)
<figcaption>Figure e1:  Artifact Types</figcaption>
</figure>

#### docker.image

expects image reference in &#34;file&#34;

```yaml linenums="1"
docker.image:
    derived_from: container.image
    metadata:
        vintner_normative: 'true'
```

#### zip.archive



```yaml linenums="1"
zip.archive:
    derived_from: source.archive
    metadata:
        vintner_normative: 'true'
```

#### tar.archive



```yaml linenums="1"
tar.archive:
    derived_from: source.archive
    metadata:
        vintner_normative: 'true'
```

#### apt.package



```yaml linenums="1"
apt.package:
    derived_from: system.package
    metadata:
        vintner_normative: 'true'
    properties:
        script:
            type: string
            required: false
            description: URL of an installation script
        repository:
            type: string
            required: false
            description: name of the repository (required if source is set)
        key:
            type: string
            required: false
            description: URL of the apt key which signs the apt repository (required if source is set)
        source:
            type: string
            required: false
            description: source of the repository
        dependencies:
            type: string
            required: false
            description: Comma separated list of apt packages that are additionally installed
        env:
            type: string
            required: false
            description: Space separated env variables
```

### Node Types

We specify the following normative node types.
An overview is given in Figure e2.

<figure markdown>
![Node Types](tosca-vintner-profile-extended.node-types.svg)
<figcaption>Figure e2:  Node Types</figcaption>
</figure>

#### nodejs.runtime



```yaml linenums="1"
nodejs.runtime:
    derived_from: software.runtime
    metadata:
        vintner_normative: 'true'
    properties:
        application_name:
            type: string
            default: nodejs
    artifacts:
        apt_package:
            type: apt.package
            file: nodejs
            properties:
                script: https://deb.nodesource.com/setup_18.x
    attributes:
        management_address:
            type: string
    capabilities:
        host:
            type: tosca.capabilities.Compute
```

#### nodejs.service.application



```yaml linenums="1"
nodejs.service.application:
    derived_from: service.application
    metadata:
        vintner_normative: 'true'
        vintner_abstract: 'true'
    properties:
        application_language:
            type: string
            default: nodejs18
    interfaces:
        management:
            type: management
            operations:
                configure: npm ci
                start: npm start
```

#### python.runtime



```yaml linenums="1"
python.runtime:
    derived_from: software.runtime
    metadata:
        vintner_normative: 'true'
    artifacts:
        apt_package:
            type: apt.package
            file: python-is-python3
            properties:
                dependencies:
                    type: string
                    default: python3 python3-pip python3-venv
    attributes:
        management_address:
            type: string
    capabilities:
        host:
            type: tosca.capabilities.Compute
```

#### python.service.application



```yaml linenums="1"
python.service.application:
    derived_from: service.application
    metadata:
        vintner_normative: 'true'
        vintner_abstract: 'true'
    properties:
        application_language:
            type: string
            default: python3
    interfaces:
        management:
            type: management
            operations:
                configure: pip install -r requirements.txt
                start: python main.py
```

#### go.service.application



```yaml linenums="1"
go.service.application:
    derived_from: service.application
    metadata:
        vintner_normative: 'true'
        vintner_abstract: 'true'
    properties:
        application_language:
            type: string
            default: go122
```

#### java.runtime



```yaml linenums="1"
java.runtime:
    derived_from: software.runtime
    metadata:
        vintner_normative: 'true'
    properties:
        application_name:
            type: string
            default: java
    artifacts:
        apt_package:
            type: apt.package
            file: openjdk-18-jre-headless
    attributes:
        management_address:
            type: string
    capabilities:
        host:
            type: tosca.capabilities.Compute
```

#### java.service.application



```yaml linenums="1"
java.service.application:
    derived_from: service.application
    metadata:
        vintner_normative: 'true'
        vintner_abstract: 'true'
    properties:
        application_language:
            type: string
            default: java21
```

#### dotnet.runtime



```yaml linenums="1"
dotnet.runtime:
    derived_from: software.runtime
    metadata:
        vintner_normative: 'true'
    properties:
        application_name:
            type: string
            default: java
    artifacts:
        apt_package:
            type: apt.package
            file: dotnet-sdk-8.0
    attributes:
        management_address:
            type: string
    capabilities:
        host:
            type: tosca.capabilities.Compute
```

#### csharp.service.application



```yaml linenums="1"
csharp.service.application:
    derived_from: service.application
    metadata:
        vintner_normative: 'true'
        vintner_abstract: 'true'
    properties:
        application_language:
            type: string
            default: dotnet8
```

#### binary.service.application



```yaml linenums="1"
binary.service.application:
    derived_from: service.application
    metadata:
        vintner_normative: 'true'
        vintner_abstract: 'true'
    properties:
        application_language:
            type: string
            default: binary
```

#### gcp.provider



```yaml linenums="1"
gcp.provider:
    derived_from: cloud.provider
    metadata:
        vintner_normative: 'true'
        vintner_abstract: 'true'
    properties:
        _hosting:
            type: string
            default: gcp
        gcp_region:
            type: string
        gcp_service_account_file:
            type: string
        gcp_project:
            type: string
    interfaces:
        Standard:
            operations:
                create: exit 0
                delete: exit 0
```

#### gcp.service



```yaml linenums="1"
gcp.service:
    derived_from: cloud.service
    metadata:
        vintner_normative: 'true'
        vintner_abstract: 'true'
    properties:
        _hosting:
            type: string
            default: gcp
        gcp_service:
            type: string
```

#### gcp.cloudrun



```yaml linenums="1"
gcp.cloudrun:
    derived_from: gcp.service
    metadata:
        vintner_normative: 'true'
    properties:
        gcp_service:
            type: string
            default: run.googleapis.com
```

#### gcp.cloudsql



```yaml linenums="1"
gcp.cloudsql:
    derived_from: gcp.service
    metadata:
        vintner_normative: 'true'
    properties:
        gcp_service:
            type: string
            default: sqladmin.googleapis.com
```

#### gcp.appengine



```yaml linenums="1"
gcp.appengine:
    derived_from: gcp.service
    metadata:
        vintner_normative: 'true'
    properties:
        gcp_service:
            type: string
            default: appengine.googleapis.com
    requirements:
        - build:
              capability: tosca.capabilities.Root
              relationship: tosca.relationships.DependsOn
        - reporting:
              capability: tosca.capabilities.Root
              relationship: tosca.relationships.DependsOn
```

#### gcp.appenginereporting



```yaml linenums="1"
gcp.appenginereporting:
    derived_from: gcp.service
    metadata:
        vintner_normative: 'true'
    properties:
        gcp_service:
            type: string
            default: appenginereporting.googleapis.com
```

#### gcp.cloudbuild



```yaml linenums="1"
gcp.cloudbuild:
    derived_from: gcp.service
    metadata:
        vintner_normative: 'true'
    properties:
        gcp_service:
            type: string
            default: cloudbuild.googleapis.com
```

#### docker.engine



```yaml linenums="1"
docker.engine:
    derived_from: container.runtime
    metadata:
        vintner_normative: 'true'
    properties:
        application_name:
            type: string
            default: docker
        _hosting:
            type: string
            default: docker
    attributes:
        management_address:
            type: string
    capabilities:
        host:
            type: tosca.capabilities.Compute
```

#### kubernetes.cluster



```yaml linenums="1"
kubernetes.cluster:
    derived_from: cloud.service
    metadata:
        vintner_normative: 'true'
        vintner_abstract: 'true'
    properties:
        _hosting:
            type: string
            default: kubernetes
        k8s_host:
            type: string
        k8s_ca_cert_file:
            type: string
        k8s_client_cert_file:
            type: string
        k8s_client_key_file:
            type: string
    capabilities:
        host:
            type: tosca.capabilities.Compute
    interfaces:
        Standard:
            operations:
                create: exit 0
                delete: exit 0
```

#### openstack.provider



```yaml linenums="1"
openstack.provider:
    derived_from: cloud.provider
    metadata:
        vintner_normative: 'true'
        vintner_abstract: 'true'
    properties:
        _hosting:
            type: string
            default: openstack
        os_region_name:
            type: string
        os_auth_type:
            type: string
        os_auth_url:
            type: string
        os_identity_api_version:
            type: string
        os_interface:
            type: string
        os_application_credential_id:
            type: string
        os_application_credential_secret:
            type: string
    interfaces:
        Standard:
            operations:
                create: exit 0
                delete: exit 0
```

#### mysql.dbms



```yaml linenums="1"
mysql.dbms:
    derived_from: relational.dbms
    metadata:
        vintner_normative: 'true'
    properties:
        dbms_name:
            type: string
        application_name:
            type: string
        dbms_version:
            type: string
            default: '5.7'
        dbms_password:
            type: string
        dbms_ssl_mode:
            type: string
            default: None
    attributes:
        application_address:
            type: string
        application_port:
            type: string
        management_address:
            type: string
        management_port:
            type: string
    capabilities:
        host:
            type: tosca.capabilities.Compute
    requirements:
        - host:
              capability: tosca.capabilities.Compute
              relationship: tosca.relationships.HostedOn
```

#### mysql.database



```yaml linenums="1"
mysql.database:
    derived_from: relational.database
    metadata:
        vintner_normative: 'true'
    properties:
        database_name:
            type: string
        database_user:
            type: string
        database_password:
            type: string
    attributes:
        application_address:
            type: string
        application_port:
            type: string
    capabilities:
        database:
            type: tosca.capabilities.Endpoint.Database
    requirements:
        - host:
              capability: tosca.capabilities.Compute
              relationship: tosca.relationships.HostedOn
```


