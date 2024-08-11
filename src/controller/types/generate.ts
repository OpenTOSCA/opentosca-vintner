import * as assert from '#assert'
import * as check from '#check'
import registry from '#controller/types/plugins'
import {METADATA} from '#controller/types/types'
import * as files from '#files'
import {NodeType} from '#spec/node-type'
import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import * as utils from '#utils'
import Queue from '#utils/queue'
import path from 'path'

export type TypesGenerateOptions = {lib: string}

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
                if (
                    [
                        'go.application',
                        'node.application',
                        'python.application',
                        'dotnet.application',
                        'java.application',
                    ].includes(type.derived_from) &&
                    hosting.length === 1 &&
                    ['gcp', 'docker'].includes(utils.first(hosting))
                ) {
                    const plugin = registry.get(`software.application::${variant}`)

                    // TODO: migrate "." to "::"
                    node_types[`${name}.${variant.replaceAll('::', '.')}`] = plugin.generate(name, type)
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
