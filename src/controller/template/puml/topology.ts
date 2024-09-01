import * as assert from '#assert'
import * as files from '#files'
import Artifact from '#graph/artifact'
import Graph from '#graph/graph'
import Group from '#graph/group'
import Loader from '#graph/loader'
import Node from '#graph/node'
import Policy from '#graph/policy'
import Relation from '#graph/relation'
import std from '#std'
import * as utils from '#utils'
import path from 'path'

export type TemplatePUMLTopologyOptions = {
    path: string
    output?: string
}

export default async function (options: TemplatePUMLTopologyOptions) {
    assert.isDefined(options.path, 'Path not defined')
    std.log(`Handling file "${path.resolve(options.path)}"`)

    const output = options.output ?? options.path.replace(/(\.yaml|\.yml)/, '.topology.puml')
    if (!output.endsWith('.puml')) throw new Error(`Output path "${output}" does not end with '.puml'`)

    const graph = new Graph(new Loader(options.path).raw())
    validate(graph)

    // TODO: refactor for all kind of elements with types? maybe even as own ejs template?
    const enlink = (element: Artifact | Group | Node | Policy | Relation) => {
        const type = element.types[0]
        const definition = type.getDefinition()
        const link = definition?.metadata?.['vintner_link']
        if (link) return `[[${link} ${type.name}]]`
        return type.name
    }

    const plot = await files.renderFile(path.join(files.TEMPLATES_DIR, 'puml', 'topology', 'template.template.ejs'), {
        graph,
        utils,
        enlink,
    })

    std.log(`Writing file "${path.resolve(output)}" if changed`)
    files.storeFile(output, plot, {onlyIfChanged: true})
}

function validate(graph: Graph) {
    // No conditional elements, e.g., types

    // Node templates can only be part of a single group
    for (const node of graph.nodes) {
        if (node.groups.length > 1) throw new Error(`${node.Display} is part of two groups`)
    }
}
