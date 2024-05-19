import Graph from '#graph/graph'
import * as utils from '#utils'

export class ElementEnricher {
    private readonly graph: Graph

    constructor(graph: Graph) {
        this.graph = graph
    }

    run() {
        /**
         * Enrich technologies
         */
        this.enrichTechnologies()
    }

    private enrichTechnologies() {
        for (const node of this.graph.nodes) {
            // Do not override manual modelled technologies
            if (!utils.isEmpty(node.technologies)) continue

            let hasCandidate = false
            for (const plugin of this.graph.plugins.technology) {
                for (const map of plugin.assign(node)) {
                    hasCandidate = true
                    // Note, this does not update node.technologies
                    this.graph.addTechnology(node, map)
                }
            }

            // Throw if technology is required but no candidate has been found
            if (this.graph.options.checks.requiredTechnology) {
                if (node.technologyRequired && !hasCandidate) {
                    throw new Error(`${node.Display} has no technology candidates`)
                }
            }
        }
    }
}
