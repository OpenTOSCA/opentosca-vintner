import * as assert from '#assert'
import * as check from '#check'
import * as files from '#files'
import Graph from '#graph/graph'
import Loader from '#graph/loader'
import {NodeType} from '#spec/node-type'
import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import {METADATA} from '#technologies/plugins/rules/implementation/types'
import {GENERATION_MARK_REGEX, GENERATION_MARK_TEXT, GENERATION_NOTICE, isType} from '#technologies/utils'
import * as utils from '#utils'
import _ from 'lodash'
import * as console from 'node:console'
import path from 'path'

export type TemplateImplementOptions = {
    dir: string
}

// TODO: has no implementation check? if nothing can be generated and if it does not already exists?

export default async function (options: TemplateImplementOptions) {
    assert.isDefined(options.dir, 'Directory not defined')

    // TODO: rework so that we dont need to craft path to service template here
    const template = await new Loader(path.join(options.dir, 'variable-service-template.yaml')).load()
    const graph = new Graph(template)

    const lib = path.join(options.dir, 'lib')
    if (!files.exists(lib)) return

    // TODO: migrate so that we dont need walkDirectory
    for (const file of files.walkDirectory(lib, {extensions: ['yaml', 'yml']})) {
        console.log(file)

        const templateString = files.loadFile(file)
        const templateData: ServiceTemplate = files.loadYAML<ServiceTemplate>(file)
        if (check.isUndefined(templateData.tosca_definitions_version)) continue
        if (templateData.tosca_definitions_version !== TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3) continue

        if (check.isUndefined(templateData.node_types)) continue

        const types = Object.entries(templateData.node_types)

        // TODO: or get the one without some specific metadata? or without some?
        const [name, type] = utils.first(types)

        // TODO: get rid of this
        //const generate = templateData.metadata[METADATA.VINTNER_GENERATE]
        //if (check.isUndefined(generate)) continue

        // TODO: get rid of this in favor of metadata VINTNER_GENERATED? (currently also not needed)
        if (isType(name)) {
            console.log('ignoring', {name})
            continue
        }

        if (check.isDefined(type.metadata) && type.metadata[METADATA.VINTNER_IMPLEMENTED] === 'true') {
            console.log('implemented', {name})
            continue
        }

        // TODO: filter abstract types?

        console.log('generating', {name})

        const implementations: {[key: string]: NodeType} = {}
        for (const plugin of graph.plugins.technology) {
            // TODO: check that there are no collisions?
            _.merge(implementations, plugin.implement(name, type))
        }

        console.log('generated', Object.keys(implementations))
        if (utils.isEmpty(implementations)) continue

        const replaceString =
            '\n\n' +
            utils.indent(GENERATION_MARK_TEXT) +
            `\n\n` +
            utils.indent(GENERATION_NOTICE) +
            `\n\n` +
            utils.indent(files.toYAML(implementations))

        const resultString = GENERATION_MARK_REGEX.test(templateString)
            ? templateString.trimEnd().replace(GENERATION_MARK_REGEX, replaceString)
            : templateString.trimEnd() + replaceString

        // TODO: write this
        //files.storeFile(file + '.another.yaml', resultString.trimEnd() + '\n')

        // TODO: remove this
        //return
    }
}
