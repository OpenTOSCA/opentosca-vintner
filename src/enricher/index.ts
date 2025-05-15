import {
    PERFORMANCE_ENRICHER_CONDITIONS,
    PERFORMANCE_ENRICHER_CONSTRAINTS,
    PERFORMANCE_ENRICHER_ELEMENTS,
} from '#controller/study/performance'
import {ConditionEnricher} from '#enricher/conditions'
import {ConstraintEnricher} from '#enricher/constraints'
import {ElementEnricher} from '#enricher/elements'
import Transformer from '#enricher/transformer'
import Graph from '#graph/graph'
import {ServiceTemplate} from '#spec/service-template'
import performance from '#utils/performance'

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
        performance.start(PERFORMANCE_ENRICHER_ELEMENTS)
        new ElementEnricher(graph).run()
        performance.stop(PERFORMANCE_ENRICHER_ELEMENTS)

        /**
         * Regenerate graph
         */
        graph = new Graph(this.serviceTemplate)

        /**
         * Condition Enricher
         */
        performance.start(PERFORMANCE_ENRICHER_CONDITIONS)
        new ConditionEnricher(graph).run()
        performance.stop(PERFORMANCE_ENRICHER_CONDITIONS)

        /**
         * Constraint Enricher
         */
        performance.start(PERFORMANCE_ENRICHER_CONSTRAINTS)
        new ConstraintEnricher(graph).run()
        performance.stop(PERFORMANCE_ENRICHER_CONSTRAINTS)

        /**
         * Transformer
         */
        new Transformer(graph, {cleanTypes: this.options.cleanTypes}).run()
    }
}
