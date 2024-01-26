import {ConditionEnricher} from '#enricher/conditions'
import {ConstraintEnricher} from '#enricher/constraints'
import {ElementEnricher} from '#enricher/elements'
import Transformer from '#enricher/transformer'
import Graph from '#graph/graph'
import {ServiceTemplate} from '#spec/service-template'

export default {enrich}

type EnrichOptions = {
    template: ServiceTemplate
}

type EnrichResult = {
    template: ServiceTemplate
}

async function enrich(options: EnrichOptions): Promise<EnrichResult> {
    /**
     * Generate graph
     */
    let graph = new Graph(options.template)

    /**
     * Element Enricher
     */
    new ElementEnricher(graph).run()

    /**
     * Regenerate graph
     */
    graph = new Graph(options.template)

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

    /**
     * Return (in-place) enriched and transformed template
     */
    return {
        template: options.template,
    }
}
