import {mapProperties} from '#controller/types/plugins/utils'
import {TypePlugin} from '#controller/types/types'

const plugin: TypePlugin = {
    id: 'software.application::terraform::gcp',
    generate: (name, type) => {
        return {
            derived_from: name,
            properties: {
                gcp_service_account_file: {
                    type: 'string',
                    default: {
                        get_input: 'gcp_service_account_file',
                    },
                },
                gcp_region: {
                    type: 'string',
                    default: {
                        get_input: 'gcp_region',
                    },
                },
                gcp_project: {
                    type: 'string',
                    default: {
                        get_input: 'gcp_project',
                    },
                },
            },
            interfaces: {
                Standard: {
                    operations: {
                        configure: {
                            implementation: {
                                primary: 'Terraform',
                            },
                        },
                        delete: {
                            implementation: {
                                primary: 'Terraform',
                            },
                        },
                    },
                },
                defaults: {
                    inputs: {
                        outputs: {
                            application_address: 'application_address',
                            application_endpoint: 'application_endpoint',
                        },
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
                                        value: '${substr(google_cloud_run_v2_service.application.uri, 8, -1)}:443',
                                    },
                                ],
                            },
                            resource: {
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
                                                            image: '{{ SELF.application_image }}',
                                                            ports: [
                                                                {
                                                                    name: 'http1',
                                                                    container_port: '{{ SELF.application_port }}',
                                                                },
                                                            ],
                                                            env: mapProperties(type),
                                                        },
                                                    ],
                                                },
                                            ],
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

export default plugin
