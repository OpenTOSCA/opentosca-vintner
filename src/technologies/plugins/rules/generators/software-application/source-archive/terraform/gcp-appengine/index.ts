import {MANAGEMENT_OPERATIONS} from '#spec/interface-definition'
import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {
    GCPProviderCredentials,
    MetadataGenerated,
    MetadataUnfurl,
    TerraformStandardOperations,
    UnfurlArtifactFile,
    mapProperties,
} from '#technologies/plugins/rules/utils'

// TODO: application_address etc

const generator: ImplementationGenerator = {
    component: 'software.application',
    technology: 'terraform',
    artifact: 'source.archive',
    hosting: ['gcp.appengine'],

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {
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
                                                    // TODO: "node index.js"? its currently "npm start"
                                                    shell: `{{ SELF._management_${MANAGEMENT_OPERATIONS.START} }}`,
                                                },
                                            ],
                                            env_variable: mapProperties(type, {format: 'map'}),
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
                                            source: UnfurlArtifactFile('source_archive'),
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
