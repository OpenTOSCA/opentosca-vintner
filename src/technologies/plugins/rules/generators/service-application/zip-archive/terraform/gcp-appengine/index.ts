import {MANAGEMENT_OPERATIONS} from '#spec/interface-definition'
import {ImplementationGenerator, PROPERTIES} from '#technologies/plugins/rules/types'
import {
    GCPProviderCredentials,
    MetadataGenerated,
    MetadataUnfurl,
    SecureApplicationProtocolPropertyDefinition,
    TerraformStandardOperations,
    UnfurlSelfManagementOperation,
    ZipArchiveFile,
    mapProperties,
} from '#technologies/plugins/rules/utils'

// TODO: application port is now 443

const generator: ImplementationGenerator = {
    component: 'service.application',
    technology: 'terraform',
    artifact: 'zip.archive',
    hosting: ['gcp.appengine'],
    weight: 1,
    comment: 'Terraform provides a declarative module.',

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
                                        value: '{{ SELF.application_name }}-dot-{{ SELF.gcp_project }}.ey.r.appspot.com',
                                    },
                                ],
                                application_endpoint: [
                                    {
                                        value: '{{ SELF.application_protocol }}://{{ SELF.application_name }}-dot-{{ SELF.gcp_project }}.ey.r.appspot.com:443',
                                    },
                                ],
                            },
                            resource: {
                                google_app_engine_standard_app_version: {
                                    app: [
                                        {
                                            delete_service_on_destroy: true,
                                            deployment: [
                                                {
                                                    zip: [
                                                        {
                                                            source_url:
                                                                'https://storage.googleapis.com/${google_storage_bucket.bucket.name}/${google_storage_bucket_object.object.name}',
                                                        },
                                                    ],
                                                },
                                            ],
                                            entrypoint: [
                                                {
                                                    shell: `{{ ${UnfurlSelfManagementOperation(
                                                        MANAGEMENT_OPERATIONS.START
                                                    )} }}`,
                                                },
                                            ],
                                            env_variables: mapProperties(type, {
                                                format: 'map',
                                                ignore: [PROPERTIES.PORT],
                                            }),
                                            runtime: '{{ SELF.application_language }}',
                                            service: '{{ SELF.application_name }}',
                                            service_account: '${google_service_account.custom_service_account.email}',
                                            version_id: 'v1',
                                        },
                                    ],
                                },
                                google_project_iam_member: {
                                    gae_api: [
                                        {
                                            member: 'serviceAccount:${google_service_account.custom_service_account.email}',
                                            project: '${google_service_account.custom_service_account.project}',
                                            role: 'roles/compute.networkUser',
                                        },
                                    ],
                                    storage_viewer: [
                                        {
                                            member: 'serviceAccount:${google_service_account.custom_service_account.email}',
                                            project: '${google_service_account.custom_service_account.project}',
                                            role: 'roles/storage.objectViewer',
                                        },
                                    ],
                                },
                                google_service_account: {
                                    custom_service_account: [
                                        {
                                            account_id: '{{ SELF.application_name }}-account',
                                            display_name: 'Custom Service Account',
                                        },
                                    ],
                                },
                                google_storage_bucket: {
                                    bucket: [
                                        {
                                            location: 'EU',
                                            name: '{{ SELF.gcp_project }}-{{ SELF.application_name }}',
                                        },
                                    ],
                                },
                                google_storage_bucket_object: {
                                    object: [
                                        {
                                            bucket: '${google_storage_bucket.bucket.name}',
                                            name: 'object.zip',
                                            source: ZipArchiveFile(),
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
