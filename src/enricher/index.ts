import Enricher from '#enricher/enricher'
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
