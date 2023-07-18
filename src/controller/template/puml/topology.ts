import * as files from '#files'
import Graph from '#graph/graph'
import {ServiceTemplate} from '#spec/service-template'
import * as utils from '#utils'
import * as validator from '#validator'
import path from 'path'

export type TemplatePUMLTopologyOptions = {
    path: string
    output?: string
}

export default async function (options: TemplatePUMLTopologyOptions) {
    validator.ensureDefined(options.path, 'Path not defined')
    console.log(`Handling file "${path.resolve(options.path)}"`)

    const output = options.output ?? options.path.replace(/(\.yaml|\.yml)/, '.topology.puml')
    if (!output.endsWith('.puml')) throw new Error(`Output path "${output}" does not end with '.puml'`)

    const graph = new Graph(files.loadYAML<ServiceTemplate>(options.path))
    validate(graph)

    const plot = await files.renderFile(
        path.join(__dirname, '..', '..', '..', 'assets', 'templates', 'puml', 'topology', 'template.template.ejs'),
        {
            graph,
            utils,
        }
    )

    console.log(`Writing file "${path.resolve(output)}" if changed`)
    files.storeFile(output, plot, {onlyIfChanged: true})
}

function validate(graph: Graph) {
    // No conditional elements, e.g., types

    // Node templates can only be part of a single group
    for (const node of graph.nodes) {
        if (node.groups.length > 1) throw new Error(`${node.Display} is part of two groups`)
    }
}
