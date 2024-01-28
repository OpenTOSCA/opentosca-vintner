import {ConditionEnricher} from '#enricher/conditions'
import {ConstraintEnricher} from '#enricher/constraints'
import {ElementEnricher} from '#enricher/elements'
import Transformer from '#enricher/transformer'
import Graph from '#graph/graph'
import {ServiceTemplate} from '#spec/service-template'

export default class Enricher {
    private readonly serviceTemplate: ServiceTemplate

    constructor(serviceTemplate: ServiceTemplate) {
        this.serviceTemplate = serviceTemplate
    }

    async run() {
        /**
         * Generate graph
         */
        let graph = new Graph(this.serviceTemplate)

        /**
         * Element Enricher
         */
        new ElementEnricher(graph).run()

        /**
         * Regenerate graph
         */
        graph = graph.regenerate()

        /**
         * Condition Enricher
         */
        new ConditionEnricher(graph).run()

        /**
         * Constraint Enricher
         */
        new ConstraintEnricher(graph).run()

        /**
         * Transformer
         */
        new Transformer(graph).run()
    }
}
