import {ConditionEnricher} from '#enricher/conditions'
import {ConstraintEnricher} from '#enricher/constraints'
import {ElementEnricher} from '#enricher/elements'
import Transformer from '#enricher/transformer'
import Graph from '#graph/graph'
import {ServiceTemplate} from '#spec/service-template'

export type Options = {
    cleanTypes: boolean
}

export default class Enricher {
    private readonly serviceTemplate: ServiceTemplate
    private readonly options: Options

    constructor(serviceTemplate: ServiceTemplate, options: Options = {cleanTypes: true}) {
        this.serviceTemplate = serviceTemplate
        this.options = options
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
        new Transformer(graph, {cleanTypes: this.options.cleanTypes}).run()
    }
}
