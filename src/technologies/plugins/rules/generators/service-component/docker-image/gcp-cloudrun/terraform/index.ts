import {ImplementationGenerator, PROPERTIES} from '#technologies/plugins/rules/types'
import {TerraformStandardOperations} from '#technologies/plugins/rules/utils/terraform'
import {
    ApplicationProperties,
    GCPProviderCredentials,
    JinjaSecureApplicationProtocol,
    MetadataGenerated,
    MetadataUnfurl,
    SecureApplicationProtocolPropertyDefinition,
} from '#technologies/plugins/rules/utils/utils'

const generator: ImplementationGenerator = {
    component: 'service.component',
    technology: 'terraform',
    artifact: 'docker.image',
    hosting: ['gcp.cloudrun'],
    weight: 1,
    reason: 'The service component is hosted on GCP CloudRun. Terraform provides an official provider for GCP. In contrast, the corresponding Ansible module does not provide resources for GCP CloudRun.',

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
                                        value: `{{ ${JinjaSecureApplicationProtocol()} }}://$\{substr(google_cloud_run_v2_service.application.uri, 8, -1)}:443`,
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
                                                            env: ApplicationProperties(type, {
                                                                ignore: [PROPERTIES.PORT],
                                                            }).toList(),
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
                                            service: '${google_cloud_run_v2_service.application.name}',
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
