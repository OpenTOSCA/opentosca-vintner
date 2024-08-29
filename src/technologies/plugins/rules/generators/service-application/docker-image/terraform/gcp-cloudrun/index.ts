import {ImplementationGenerator, PROPERTIES} from '#technologies/plugins/rules/types'
import {
    GCPProviderCredentials,
    HOTFIX_SECURE_PROTOCOL_FILTER,
    MetadataGenerated,
    MetadataUnfurl,
    SecureApplicationProtocolPropertyDefinition,
    TerraformStandardOperations,
    mapProperties,
} from '#technologies/plugins/rules/utils'

// TODO: application port is now 443 (also applies to other GCP deployments)

const generator: ImplementationGenerator = {
    component: 'service.application',
    technology: 'terraform',
    artifact: 'docker.image',
    hosting: ['gcp.cloudrun'],
    weight: 1,
    reason: 'Terraform provides a declarative module.',
    details: '"google_cloud_run_v2_service" and "google_cloud_run_service_iam_binding" resources',

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {
                ...SecureApplicationProtocolPropertyDefinition(type),
                ...GCPProviderCredentials(),
            },
            interfaces: {
                ...TerraformStandardOperations(),
                defaults: {
                    outputs: {
                        application_address: 'application_address',
                        application_endpoint: 'application_endpoint',
                    },
                    inputs: {
                        main: {
                            terraform: [
                                {
                                    required_providers: [
                                        {
                                            google: {
                                                source: 'hashicorp/google',
                                                version: '5.39.1',
                                            },
                                        },
                                    ],
                                },
                            ],
                            provider: {
                                google: [
                                    {
                                        credentials: '{{ SELF.gcp_service_account_file }}',
                                        project: '{{ SELF.gcp_project }}',
                                        region: '{{ SELF.gcp_region }}',
                                    },
                                ],
                            },
                            output: {
                                application_address: [
                                    {
                                        value: '${substr(google_cloud_run_v2_service.application.uri, 8, -1)}',
                                    },
                                ],
                                application_endpoint: [
                                    {
                                        value: `{{ SELF.application_protocol  | ${HOTFIX_SECURE_PROTOCOL_FILTER} }}://$\{substr(google_cloud_run_v2_service.application.uri, 8, -1)}:443`,
                                    },
                                ],
                            },
                            resource: {
                                google_cloud_run_v2_service: {
                                    application: [
                                        {
                                            ingress: 'INGRESS_TRAFFIC_ALL',
                                            location: '{{ SELF.gcp_region }}',
                                            name: '{{ SELF.application_name }}',
                                            template: [
                                                {
                                                    containers: [
                                                        {
                                                            image: '{{ ".artifacts::docker_image::file" | eval }}',
                                                            ports: [
                                                                {
                                                                    name: 'http1',
                                                                    container_port: '{{ SELF.application_port }}',
                                                                },
                                                            ],
                                                            env: mapProperties(type, {ignore: [PROPERTIES.PORT]}),
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                                google_cloud_run_service_iam_binding: {
                                    application: [
                                        {
                                            location: '{{ SELF.gcp_region }}',
                                            members: ['allUsers'],
                                            role: 'roles/run.invoker',
                                            service: '{{ SELF.application_name }}',
                                        },
                                    ],
                                },
                            },
                        },
                    },
                },
            },
        }
    },
}

export default generator
