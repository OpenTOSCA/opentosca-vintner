import * as check from '#check'
import Element from '#graph/element'
import Graph from '#graph/graph'
import {generatify, simplify} from '#graph/utils'
import {LogicExpression} from '#spec/variability'
import * as utils from '#utils'

export class ConditionEnricher {
    private readonly graph: Graph

    constructor(graph: Graph) {
        this.graph = graph
    }

    run() {
        /**
         * Pruning conditions
         */
        for (const element of this.graph.elements) {
            this.enrichConditions(element)
        }
    }

    private enrichConditions(element: Element) {
        // Collect assigned conditions
        let conditions: LogicExpression[] = [...element.conditions]
        if (element.isNode() || element.isRelation()) {
            element.groups.filter(group => group.variability).forEach(group => conditions.push(...group.conditions))
        }
        conditions = utils.filterNotNull(conditions)

        // Add condition that checks if no other bratan is present
        // This condition is considered as manual condition
        if (element.defaultAlternative) {
            if (check.isUndefined(element.defaultAlternativeCondition))
                throw new Error(`${element.Display} has no default alternative condition`)
            conditions = [generatify(element.defaultAlternativeCondition)]
        }

        // Enrich pruning
        this.enrichPruning(element, conditions)

        // Store enriched conditions
        element.conditions = conditions
    }

    private enrichPruning(element: Element, conditions: LogicExpression[]) {
        const candidates = [element.getTypeSpecificCondition(), element.getElementGenericCondition()]
        const candidate = candidates.find(condition => {
            // Ignore undefined
            if (check.isUndefined(condition)) return false

            // Add default condition if requested
            if (element.defaultEnabled && utils.isEmpty(conditions)) {
                // If targets consistency and if allowed
                if (condition?.consistency && element.defaultConsistencyCondition) return true

                // If targets semantics and if allowed
                if (condition?.semantic && element.defaultSemanticCondition) return true
            }

            // Add pruning condition if requested
            if (element.pruningEnabled) {
                // If targets consistency and if allowed
                if (condition?.consistency && element.consistencyPruning) return true

                // If targets semantics and if allowed
                if (condition?.semantic && element.semanticPruning) return true
            }

            // Otherwise
            return false
        })
        if (check.isDefined(candidate)) conditions.unshift(generatify(simplify(candidate.conditions)))
    }
}
