import * as assert from '#assert'
import * as files from '#files'
import Graph from '#graph/graph'
import Loader from '#graph/loader'
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

    const plot = await files.renderFile(path.join(files.TEMPLATES_DIR, 'puml', 'topology', 'template.template.ejs'), {
        graph,
        utils,
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
