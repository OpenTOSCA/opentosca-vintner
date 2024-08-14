import * as assert from '#assert'
import * as check from '#check'
import * as files from '#files'
import Graph from '#graph/graph'
import Loader from '#graph/loader'
import {NodeType} from '#spec/node-type'
import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import std from '#std'
import {METADATA} from '#technologies/plugins/rules/implementation/types'
import {
    GENERATION_MARK_REGEX,
    GENERATION_MARK_TEXT,
    GENERATION_NOTICE,
    isGenerated,
    isImplementation,
} from '#technologies/utils'
import * as utils from '#utils'
import _ from 'lodash'
import path from 'path'

export type TemplateImplementOptions = {
    dir: string
}

// TODO: has no implementation check? if nothing can be generated and if it does not already exists?

export default async function (options: TemplateImplementOptions) {
    assert.isDefined(options.dir, 'Directory not defined')

    const template = await new Loader(path.join(options.dir, 'variable-service-template.yaml')).load()
    const graph = new Graph(template)

    const lib = path.join(options.dir, 'lib')
    if (!files.exists(lib)) return
    for (const file of files.walkDirectory(lib, {extensions: ['yaml', 'yml']})) {
        std.log(`processing file "${file}"`)

        const templateString = files.loadFile(file)
        const templateData: ServiceTemplate = files.loadYAML<ServiceTemplate>(file)

        if (check.isUndefined(templateData.tosca_definitions_version)) {
            std.log(
                `ignoring file "${file}" since has no TOSCA Definitions Version and, hence, most likely is not a TOSCA Service Template`
            )
            continue
        }

        if (templateData.tosca_definitions_version !== TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3) {
            std.log(
                `ignoring file "${file}" since TOSCA Definitions Version "${template.tosca_definitions_version}" is not supported`
            )
            continue
        }

        if (check.isUndefined(templateData.node_types)) {
            std.log(`ignoring file "${file}" since it does not define Node Types`)
            continue
        }
        const implementations: {[key: string]: NodeType} = {}

        Object.entries(templateData.node_types)
            .filter(([name, type]) => {
                // Ignore generated implementations
                if (isGenerated(type)) return false

                // Ignore manual modeled implementations
                if (isImplementation(name)) return false

                // Ignore manual ignored types
                // TODO: include this somehow in rule, e.g. "rule.abstract"?
                if (check.isDefined(type.metadata)) return type.metadata[METADATA.VINTNER_GENERATE] !== 'false'

                // Otherwise include
                return true
            })
            .forEach(([name, type]) => {
                std.log(`processing node type "${name}"`)
                for (const plugin of graph.plugins.technology) {
                    // TODO: check that there are no collisions?
                    _.merge(implementations, plugin.implement(name, type))
                }
            })

        if (utils.isEmpty(implementations)) {
            std.log(`no implementations must be written`)
            continue
        }

        const replaceString =
            '\n\n' +
            utils.indent(GENERATION_MARK_TEXT) +
            `\n\n` +
            utils.indent(GENERATION_NOTICE) +
            `\n\n` +
            utils.indent(files.toYAML(implementations))

        const resultString =
            (GENERATION_MARK_REGEX.test(templateString)
                ? templateString.trimEnd().replace(GENERATION_MARK_REGEX, replaceString)
                : templateString.trimEnd() + replaceString
            ).trimEnd() + '\n'

        if (templateString === resultString) {
            std.log('implementations did not change')
            continue
        }

        files.storeFile(file, resultString)
    }
}
