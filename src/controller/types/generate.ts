import * as assert from '#assert'
import * as check from '#check'
import * as files from '#files'
import {NodeType} from '#spec/node-type'
import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import * as utils from '#utils'
import Queue from '#utils/queue'
import path from 'path'

export type TypesGenerateOptions = {lib: string}

enum METADATA {
    VINTNER_GENERATE = 'vintner_generate',
    VINTNER_IGNORE = 'vintner_ignore',
    VINTNER_NAME = 'vintner_name',
}

// TODO: generate types
export default async function (options: TypesGenerateOptions) {
    assert.isDefined(options.lib)

    const dirs = new Queue<string>()
    dirs.add(path.resolve(options.lib))
    while (!dirs.isEmpty()) {
        const dir = dirs.next()
        files.listDirectories(dir).forEach(it => dirs.add(path.resolve(dir, it)))

        for (const file of files.listFiles(dir)) {
            if (!file.endsWith('.yaml') && !file.endsWith('.yml')) continue

            const resolved = path.resolve(dir, file)

            const template: ServiceTemplate = files.loadYAML<ServiceTemplate>(resolved)
            if (check.isUndefined(template.tosca_definitions_version)) continue
            if (template.tosca_definitions_version !== TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3) continue

            if (check.isUndefined(template.metadata)) continue

            // TODO: get this from rules by simply checking if rule.component isA this.type
            const generate = template.metadata[METADATA.VINTNER_GENERATE]
            if (check.isUndefined(generate)) continue

            const types = Object.entries(template.node_types || {})
            // TODO: if (types.length !== 1) throw new Error(`"${resolved}" has not exactly one node type defined`)
            const [name, type] = utils.first(types)
            assert.isDefined(type.derived_from)

            const node_types: {[key: string]: NodeType} = {}

            for (const variant of generate.split(', ')) {
                const [technology, ...hosting] = variant.split('::')
                assert.isDefined(technology)
                assert.isDefined(hosting)

                // TODO: actually we would need to check the type hierarchy node type is derived from "software.application"
                const allowed = [
                    'go.application',
                    'node.application',
                    'python.application',
                    'dotnet.application',
                    'java.application',
                ]

                if (
                    allowed.includes(type.derived_from) &&
                    technology === 'ansible' &&
                    hosting.length === 1 &&
                    utils.first(hosting) === 'gcp'
                ) {
                    // TODO: migrate "." to "::"
                    node_types[`${name}.${variant.replaceAll('::', '.')}`] = {
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
                                    create: {
                                        implementation: {
                                            primary: 'Ansible',
                                            operation_host: 'ORCHESTRATOR',
                                        },
                                        inputs: {
                                            playbook: {
                                                q: [
                                                    {
                                                        name: 'activate service account',
                                                        'ansible.builtin.shell':
                                                            'gcloud auth activate-service-account --key-file {{ SELF.gcp_service_account_file }} --project {{ SELF.gcp_project }}',
                                                    },
                                                    {
                                                        name: 'touch service',
                                                        register: 'service',
                                                        'ansible.builtin.tempfile': {
                                                            suffix: '{{ SELF.application_name }}.service.yaml',
                                                        },
                                                    },
                                                    {
                                                        name: 'create service',
                                                        'ansible.builtin.copy': {
                                                            dest: '{{ service.path }}',
                                                            content: '{{ manifest | to_yaml }}',
                                                        },
                                                        vars: {
                                                            manifest: {
                                                                apiVersion: 'serving.knative.dev/v1',
                                                                kind: 'Service',
                                                                metadata: {
                                                                    name: '{{ SELF.application_name }}',
                                                                    labels: {
                                                                        'cloud.googleapis.com/location':
                                                                            '{{ SELF.gcp_region }}',
                                                                    },
                                                                    annotations: {
                                                                        'run.googleapis.com/ingress': 'all',
                                                                    },
                                                                },
                                                                spec: {
                                                                    template: {
                                                                        spec: {
                                                                            containers: [
                                                                                {
                                                                                    image: '{{ SELF.application_image }}',
                                                                                    ports: [
                                                                                        {
                                                                                            name: 'http1',
                                                                                            containerPort:
                                                                                                '{{ SELF.application_port }}',
                                                                                        },
                                                                                    ],
                                                                                    env: Object.entries(
                                                                                        type.properties || {}
                                                                                    )
                                                                                        .map(
                                                                                            ([
                                                                                                propertyName,
                                                                                                propertyDefinition,
                                                                                            ]) => {
                                                                                                const metadata =
                                                                                                    propertyDefinition.metadata ||
                                                                                                    {}

                                                                                                const ignore =
                                                                                                    metadata[
                                                                                                        METADATA
                                                                                                            .VINTNER_IGNORE
                                                                                                    ]

                                                                                                if (
                                                                                                    ignore === true ||
                                                                                                    ignore === 'true'
                                                                                                )
                                                                                                    return null

                                                                                                const name =
                                                                                                    metadata[
                                                                                                        METADATA
                                                                                                            .VINTNER_NAME
                                                                                                    ] ??
                                                                                                    propertyName.toUpperCase()
                                                                                                const value = `{{ SELF.${propertyName} }}`

                                                                                                return {
                                                                                                    name,
                                                                                                    value,
                                                                                                }
                                                                                            }
                                                                                        )
                                                                                        .filter(it =>
                                                                                            check.isDefined(it)
                                                                                        ),
                                                                                },
                                                                            ],
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                    {
                                                        name: 'apply service',
                                                        'ansible.builtin.shell':
                                                            'gcloud run services replace {{ service.path }} --quiet',
                                                    },
                                                    {
                                                        name: 'touch policy',
                                                        register: 'policy',
                                                        'ansible.builtin.tempfile': {
                                                            suffix: '{{ SELF.application_name }}.policy.yaml',
                                                        },
                                                    },
                                                    {
                                                        name: 'fill policy',
                                                        'ansible.builtin.copy': {
                                                            dest: '{{ policy.path }}',
                                                            content: '{{ manifest | to_yaml }}',
                                                        },
                                                        vars: {
                                                            manifest: {
                                                                bindings: [
                                                                    {
                                                                        members: ['allUsers'],
                                                                        role: 'roles/run.invoker',
                                                                    },
                                                                ],
                                                            },
                                                        },
                                                    },
                                                    {
                                                        name: 'apply policy',
                                                        'ansible.builtin.shell':
                                                            'gcloud run services set-iam-policy {{ SELF.application_name }} {{ policy.path }} --region {{ SELF.gcp_region }} --quiet',
                                                    },
                                                    {
                                                        name: 'describe service',
                                                        register: 'service_description',
                                                        'ansible.builtin.shell':
                                                            'gcloud run services describe {{ SELF.application_name }} --region {{ SELF.gcp_region }} --quiet --format=json',
                                                    },
                                                    {
                                                        name: 'set attributes',
                                                        set_fact: {
                                                            application_address:
                                                                '{{ (service_description.stdout | from_json ).status.url[8:] | trim }}',
                                                            application_endpoint:
                                                                '{{ (service_description.stdout | from_json ).status.url[8:] | trim }}:443',
                                                        },
                                                    },
                                                ],
                                            },
                                            resultTemplate:
                                                '- name: SELF\n  attributes:\n    application_address: "{{ outputs.application_address }}"\n    application_endpoint: "{{ outputs.application_endpoint }}"\n',
                                        },
                                        outputs: {
                                            application_address: null,
                                            application_endpoint: null,
                                        },
                                    },
                                    delete: {
                                        implementation: {
                                            primary: 'Ansible',
                                            operation_host: 'ORCHESTRATOR',
                                        },
                                        inputs: {
                                            playbook: {
                                                q: [
                                                    {
                                                        name: 'activate service account',
                                                        'ansible.builtin.shell':
                                                            'gcloud auth activate-service-account --key-file {{ SELF.gcp_service_account_file }} --project {{ SELF.gcp_project }}',
                                                    },
                                                    {
                                                        name: 'create app',
                                                        'ansible.builtin.shell':
                                                            'gcloud run services delete {{ SELF.application_name }} --region {{ SELF.gcp_region }} --quiet',
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    }
                }
            }

            const output = resolved.replace('.yaml', '.implementation.yaml')
            const data = {
                tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3,
                node_types,
            }
            files.storeYAML(output, data, {notice: true})
        }
    }
}
