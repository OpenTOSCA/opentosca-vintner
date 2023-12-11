import * as assert from '#assert'
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
        // This condition is considered as manual condition
        if (element.defaultAlternative) {
            if (check.isUndefined(element.defaultAlternativeCondition))
                throw new Error(`${element.Display} has no default alternative condition`)
            conditions = [generatify(element.defaultAlternativeCondition)]
        }

        // Imply element if requested
        // TODO: before or after bratans?
        this.enrichImplications(element, conditions)

        // TODO: remove this hotfix
        // Add default condition if requested
        if (element.defaultEnabled && utils.isEmpty(conditions)) {
            const condition = element.defaultCondition
            if (check.isDefined(condition)) {
                if (
                    (condition?.consistency && element.defaultConsistencyCondition) ||
                    (condition?.semantic && element.defaultSemanticCondition)
                ) {
                    conditions.unshift(generatify(condition.conditions as any))
                }
            }
        } // Add pruning condition if requested
        else if (element.pruningEnabled) {
            const condition = element.defaultCondition
            if (check.isDefined(condition)) {
                if (
                    (condition?.consistency && element.consistencyPruning) ||
                    (condition?.semantic && element.semanticPruning)
                ) {
                    conditions.unshift(generatify(condition.conditions as any))
                }
            }
        }

        // Store enriched conditions
        element.conditions = conditions
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
