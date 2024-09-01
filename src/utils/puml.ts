import * as files from '#files'
import Graph from '#graph/graph'
import {EntityTypes} from '#spec/service-template'
import * as utils from '#utils'
// TODO: provide typescript
//@ts-ignore
import plantuml from 'node-plantuml'
import path from 'path'

export async function renderTopology(graph: Graph, options: {format?: 'puml' | 'svg'} = {}): Promise<string> {
    options.format = options.format ?? 'puml'

    validateTopology(graph)

    const plot = await files.renderFile(path.join(files.TEMPLATES_DIR, 'puml', 'topology', 'template.template.ejs'), {
        graph,
        utils,
    })

    if (options.format === 'puml') return plot

    if (options.format === 'svg') {
        return new Promise((resolve, reject) => {
            plantuml.generate(plot, {format: 'svg'}, (error: Error, data: Buffer) => {
                if (error) return reject(error)
                return resolve(data.toString('utf-8'))
            })
        })
    }

    throw new Error(`Format "${options.format}" not supported`)
}

function validateTopology(graph: Graph) {
    // No conditional elements, e.g., types

    // Node templates can only be part of a single group
    for (const node of graph.nodes) {
        if (node.groups.length > 1) throw new Error(`${node.Display} is part of two groups`)
    }
}

export async function renderTypes(graph: Graph, key: keyof EntityTypes) {
    return await files.renderFile(path.join(files.TEMPLATES_DIR, 'puml', 'types', 'types.template.ejs'), {
        graph,
        utils,
        key,
    })
}
