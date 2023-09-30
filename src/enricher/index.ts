import Enricher from '#enricher/enricher'
import Transformer from '#enricher/transformer'
import Graph from '#graph/graph'
import Normalizer from '#normalizer'
import {ServiceTemplate} from '#spec/service-template'

export default {enrich}

type EnrichOptions = {
    template: ServiceTemplate
}

type EnrichResult = {
    template: ServiceTemplate
}

async function enrich(options: EnrichOptions): Promise<EnrichResult> {
    // Extend graph
    new Normalizer(options.template).extend()

    // Generate graph
    const graph = new Graph(options.template)

    // Enrich conditions
    new Enricher(graph).run()

    // Remove all pruning concepts
    new Transformer(graph).run()

    return {
        template: options.template,
    }
}
