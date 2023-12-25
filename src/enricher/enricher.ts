import * as assert from '#assert'
import * as check from '#check'
import Element from '#graph/element'
import Graph from '#graph/graph'
import {generatify, simplify} from '#graph/utils'
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
        // This condition is considered as manual condition
        if (element.defaultAlternative) {
            if (check.isUndefined(element.defaultAlternativeCondition))
                throw new Error(`${element.Display} has no default alternative condition`)
            conditions = [generatify(element.defaultAlternativeCondition)]
        }

        // Imply element if requested
        // TODO: before or after bratans?
        this.enrichImplications(element, conditions)

        // Enrich pruning
        this.enrichPruning(element, conditions)

        // Store enriched conditions
        element.conditions = conditions
    }

    enrichPruning(element: Element, conditions: LogicExpression[]) {
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

    /**
     * If requests, then the manual condition of an element implies this element
     * This ensures, e.g., that a relation is present under a given condition while using incoming-host
     *
     * This is most likely only relevant for relations.
     * However, the method is still written in a generic way.
     */
    private enrichImplications(element: Element, conditions: LogicExpression[]) {
        if (utils.isEmpty(conditions)) return
        if (check.isUndefined(element.container)) return

        const implied = element.raw.implied
        if (check.isUndefined(implied)) return
        if (check.isFalse(implied)) return

        let left
        if (implied === 'TARGET') {
            assert.isRelation(element)
            left = element.target.id
        }
        if (implied === 'SOURCE' || implied === 'CONTAINER' || check.isTrue(implied)) {
            left = element.container.id
        }
        assert.isDefined(left, 'Left not defined')

        this.graph.addConstraint({
            implies: [{and: [element.container.id, element.manualId]}, element.id],
        })
    }
}
