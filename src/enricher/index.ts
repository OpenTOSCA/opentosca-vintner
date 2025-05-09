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
        performance.start('enricher_run')
        new ElementEnricher(graph).run()
        performance.stop('enricher_run')

        /**
         * Regenerate graph
         */
        graph = new Graph(this.serviceTemplate)

        /**
         * Condition Enricher
         */
        performance.start('enricher_run')
        new ConditionEnricher(graph).run()

        /**
         * Constraint Enricher
         */
        new ConstraintEnricher(graph).run()

        /**
         * Transformer
         */
        new Transformer(graph, {cleanTypes: this.options.cleanTypes}).run()
        performance.stop('enricher_run')
    }
}
