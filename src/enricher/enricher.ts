import * as check from '#check'
import Element from '#graph/element'
import Graph from '#graph/graph'
import {generatify} from '#graph/utils'
import {LogicExpression} from '#spec/variability'
import * as utils from '#utils'

export default class Enricher {
    private readonly graph: Graph

    private transformed = false

    constructor(graph: Graph) {
        this.graph = graph
    }

    run() {
        if (this.transformed) return
        this.transformed = true

        for (const element of this.graph.elements) this.enrichConditions(element)
    }

    enrichConditions(element: Element) {
        // Collect assigned conditions
        let conditions: LogicExpression[] = [...element.conditions]
        if (element.isNode() || element.isRelation()) {
            element.groups.filter(group => group.variability).forEach(group => conditions.push(...group.conditions))
        }
        conditions = utils.filterNotNull(conditions)

        // Add condition that checks if no other bratan is present
        if (element.defaultAlternative) {
            if (check.isUndefined(element.defaultAlternativeCondition))
                throw new Error(`${element.Display} has no default alternative condition`)
            conditions = [generatify(element.defaultAlternativeCondition)]
        }

        // Add default condition if requested
        if (element.pruningEnabled || (element.defaultEnabled && utils.isEmpty(conditions))) {
            conditions.unshift(generatify(element.defaultCondition))
        }

        // Store enriched conditions
        element.conditions = conditions
    }
}
