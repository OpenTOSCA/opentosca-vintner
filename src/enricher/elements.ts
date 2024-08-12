import Graph from '#graph/graph'
import {TechnologyTemplateMap} from '#spec/technology-template'
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

    // TODO: split this into enrichTechnologies and enrichImplementations (and introduce plugin.implement)
    private enrichTechnologies() {
        for (const node of this.graph.nodes) {
            // Get all possible technology assignments
            const candidates: TechnologyTemplateMap[] = []
            for (const plugin of this.graph.plugins.technology) {
                candidates.push(...plugin.assign(node))
            }

            if (utils.isEmpty(node.technologies)) {
                // Throw if technology is required but no candidate has been found
                if (this.graph.options.checks.requiredTechnology) {
                    if (node.technologyRequired && utils.isEmpty(candidates)) {
                        throw new Error(`${node.Display} has no technology candidates`)
                    }
                }

                // Assign each possible technology assignment
                candidates.forEach(it => this.graph.addTechnology(node, it))
            } else {
                // Continue if e.g. no rules at all exists
                if (utils.isEmpty(this.graph.plugins.technology)) continue

                // Do not override manual assigned technologies but enrich them with an implementation
                const enriched: TechnologyTemplateMap[] = []

                node.technologies.forEach(technology => {
                    const filtered = candidates.filter(map => utils.firstKey(map) === technology.name)
                    if (utils.isEmpty(filtered))
                        throw new Error(`${node.Display} has no implementation for ${technology.display}`)
                    enriched.push(...filtered)
                })

                this.graph.replaceTechnologies(node, enriched)
            }
        }
    }
}
