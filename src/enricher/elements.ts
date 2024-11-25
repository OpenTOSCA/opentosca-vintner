import * as assert from '#assert'
import * as check from '#check'
import Graph from '#graph/graph'
import Node from '#graph/node'
import {TechnologyTemplateMap} from '#spec/technology-template'
import * as utils from '#utils'

export class ElementEnricher {
    private readonly graph: Graph

    constructor(graph: Graph) {
        this.graph = graph
    }

    run() {
        /**
         * Enrich implementations
         */
        if (this.graph.options.enricher.implementations) this.enrichImplementations()

        /**
         * Enrich technologies
         */
        if (this.graph.options.enricher.technologies) this.enrichTechnologies()
    }

    private getTechnologyCandidates(node: Node) {
        const candidates: TechnologyTemplateMap[] = []
        for (const plugin of this.graph.plugins.technology.filter(it => it.backwards())) {
            candidates.push(...plugin.assign(node))
        }
        return candidates
    }

    /**
     * This is not part of the VDMM method but of our prototype!
     * This is just attaching the DTSMs to the components.
     * However, we might add a check that manually modeled technology assignments actually support the scenario.
     */
    private enrichImplementations() {
        // for backwards compatibility and testing purposed, continue if, e.g., no rules at all exists
        if (utils.isEmpty(this.graph.plugins.technology.filter(it => it.backwards()))) return

        for (const node of this.graph.nodes.filter(it => it.managed).filter(it => utils.isPopulated(it.technologies))) {
            // Do not override manual assigned technologies but enrich them with an implementation
            const enriched: TechnologyTemplateMap[] = []

            node.technologies.forEach(technology => {
                // TODO: super inefficient but we need copies for each since the same technology might be defined multiple times
                const candidates = this.getTechnologyCandidates(node)
                const selected = candidates.filter(map => utils.firstKey(map) === technology.name)

                for (const map of selected) {
                    const template = utils.firstValue(map)
                    if (utils.isPopulated(technology.conditions)) {
                        // TODO: improve plugin typing!
                        // assert.isArray(template.conditions)
                        assert.isDefined(template.conditions)
                        template.conditions = [
                            ...technology.conditions,
                            ...(check.isArray(template.conditions) ? template.conditions : [template.conditions]),
                        ]
                    }
                }

                if (utils.isEmpty(selected))
                    throw new Error(`${node.Display} has no implementation for ${technology.display}`)

                enriched.push(...selected)
            })
            this.graph.replaceTechnologies(node, enriched)
        }
    }

    private enrichTechnologies() {
        for (const node of this.graph.nodes.filter(it => it.managed).filter(it => utils.isEmpty(it.technologies))) {
            // Get all possible technology assignments
            const candidates = this.getTechnologyCandidates(node)

            // Throw if technology is required but no candidate has been found
            if (this.graph.options.checks.requiredTechnology) {
                if (utils.isEmpty(candidates)) {
                    throw new Error(`${node.Display} has no technology candidates`)
                }
            }

            // Assign each possible technology assignment
            candidates.forEach(it => this.graph.addTechnology(node, it))
        }
    }
}
