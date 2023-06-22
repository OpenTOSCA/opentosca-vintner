import * as files from '#files'
import Graph from '#graph/graph'
import * as utils from '#utils'
import path from 'path'

export class PUML {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph
        this.validate()
    }

    validate() {
        // No conditional elements, e.g., types

        // Node templates can only be part of a single group
        for (const node of this.graph.nodes) {
            if (node.groups.length > 1) throw new Error(`${node.Display} is part of two groups`)
        }
    }

    async plotTopology() {
        return files.renderFile(
            path.join(__dirname, '..', 'assets', 'templates', 'puml', 'topology', 'template.template.ejs'),
            {
                graph: this.graph,
                utils,
            }
        )
    }

    async plotTypes(types?: string[]) {
        types = types ?? Object.keys(this.graph.serviceTemplate).filter(it => it.endsWith('_types'))

        const result: {[key: string]: string} = {}
        for (const type of types) {
            result[type] = await files.renderFile(
                path.join(__dirname, '..', 'assets', 'templates', 'puml', 'types', 'types.template.ejs'),
                {
                    graph: this.graph,
                    utils,
                    type,
                }
            )
        }
        return result
    }
}
