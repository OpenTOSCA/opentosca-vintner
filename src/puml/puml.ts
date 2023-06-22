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

        // Components can only be part of a single group
        for (const node of this.graph.nodes) {
            if (node.groups.length > 1) throw new Error(`${node.Display} is part of two groups`)
        }
    }

    async plot() {
        return files.renderFile(path.join(__dirname, '..', 'assets', 'templates', 'puml', 'template.template.ejs'), {
            graph: this.graph,
            utils,
        })
    }
}
