import * as check from '#check'
import * as files from '#files'
import Artifact from '#graph/artifact'
import Element from '#graph/element'
import Graph from '#graph/graph'
import Node from '#graph/node'
import {EntityTypes} from '#spec/service-template'
import * as utils from '#utils'
import plantuml from 'node-plantuml'
import path from 'path'

export type RenderOptions = {format?: 'puml' | 'svg'}

export async function renderTopology(graph: Graph, options: RenderOptions = {}): Promise<string> {
    validateTopology(graph)

    const plot = await files.renderFile(path.join(files.TEMPLATES_DIR, 'puml', 'topology', 'template.template.ejs'), {
        graph,
        utils,
        puml: {
            toText: (element: Node | Artifact) => {
                const name = element.name
                const type = element.types[0].name
                const text = `${name}\\n(${type})`

                return text //.padStart(2 * (type.length + 2), ' ')
            },
            toId: (element: Element) => {
                return element.id.replaceAll('@', '_').replaceAll('.', '_').replaceAll(' ', '_')
            },
            hasLink: (element: Node | Artifact) => {
                return check.isDefined(element.types[0].getDefinition()?.metadata?.['vintner_link'])
            },
            getLink: (element: Node | Artifact) => {
                return element.types[0].getDefinition()?.metadata?.['vintner_link']
            },
        },
    })

    return renderPUML(plot, options)
}

export async function renderTypes(graph: Graph, key: keyof EntityTypes, options: RenderOptions = {}): Promise<string> {
    const plot = await files.renderFile(path.join(files.TEMPLATES_DIR, 'puml', 'types', 'types.template.ejs'), {
        graph,
        utils,
        key,
    })

    return renderPUML(plot, options)
}

function validateTopology(graph: Graph) {
    // No conditional elements, e.g., types

    // Node templates can only be part of a single group
    for (const node of graph.nodes) {
        if (node.groups.length > 1) throw new Error(`${node.Display} is part of two groups`)
    }
}

async function renderPUML(plot: string, options: RenderOptions = {}): Promise<string> {
    options.format = options.format ?? 'puml'

    if (options.format === 'puml') return plot

    if (options.format === 'svg') {
        return new Promise((resolve, reject) => {
            plantuml.generate(plot, {format: 'svg'}, (error: Error, buffer: Buffer) => {
                if (error) return reject(error)
                const raw = buffer.toString('utf-8')
                const cleaned = raw.slice(57).replace(/(\r\n|\n|\r)/gm, '')
                return resolve(cleaned)
            })
        })
    }

    throw new Error(`Format "${options.format}" not supported`)
}
