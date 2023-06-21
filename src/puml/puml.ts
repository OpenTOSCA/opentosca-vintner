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

    // TODO: validate
    validate() {
        // Components can only be part of a single group
        // No conditional elements, e.g., types
    }

    async plot() {
        return files.renderFile(path.join(__dirname, '..', 'assets', 'templates', 'puml', 'template.template.ejs'), {
            graph: this.graph,
            utils,
        })
    }
}
