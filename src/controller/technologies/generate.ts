import * as assert from '#assert'
import * as check from '#check'
import {GENERATION_MARK_REGEX, GENERATION_MARK_TEXT, GENERATION_NOTICE} from '#controller/technologies/utils'
import * as files from '#files'
import {NodeType} from '#spec/node-type'
import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import registry from '#technologies/plugins/implementation'
import {METADATA} from '#technologies/plugins/implementation/types'
import {constructType} from '#technologies/utils'
import * as utils from '#utils'

export type TypesGenerateOptions = {lib: string}

// TODO: generate types
export default async function (options: TypesGenerateOptions) {
    assert.isDefined(options.lib)

    for (const file of files.walkDirectory(options.lib)) {
        if (!file.endsWith('.yaml') && !file.endsWith('.yml')) continue

        const templateString = files.loadFile(file)
        const templateData: ServiceTemplate = files.loadYAML<ServiceTemplate>(file)
        if (check.isUndefined(templateData.tosca_definitions_version)) continue
        if (templateData.tosca_definitions_version !== TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3) continue

        if (check.isUndefined(templateData.metadata)) continue

        // TODO: get this from rules by simply checking if rule.component isA this.type
        const generate = templateData.metadata[METADATA.VINTNER_GENERATE]
        if (check.isUndefined(generate)) continue

        const types = Object.entries(templateData.node_types || {})
        // TODO: if (types.length !== 1) throw new Error(`"${resolved}" has not exactly one node type defined`)
        const [name, type] = utils.first(types)
        assert.isDefined(type.derived_from)

        const generated: {[key: string]: NodeType} = {}

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
                ].includes(type.derived_from)
            ) {
                const plugin = registry.get(constructType('software.application', technology, hosting))
                generated[constructType(name, technology, hosting)] = plugin.generate(name, type)
            }
        }

        const replaceString =
            '\n\n' +
            utils.indent(GENERATION_MARK_TEXT) +
            `\n\n` +
            utils.indent(GENERATION_NOTICE) +
            `\n\n` +
            utils.indent(files.toYAML(generated))

        const resultString = GENERATION_MARK_REGEX.test(templateString)
            ? templateString.trimEnd().replace(GENERATION_MARK_REGEX, replaceString)
            : templateString.trimEnd() + replaceString

        files.storeFile(file, resultString.trimEnd() + '\n')
    }
}
