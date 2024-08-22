import * as assert from '#assert'
import * as check from '#check'
import Element from '#graph/element'
import Graph from '#graph/graph'
import {andify, generatify, simplify} from '#graph/utils'
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
            // Note, do not generatify this since this condition is implied when implying a relation
            conditions = [element.defaultAlternativeCondition]
        }

        // Enrich input condition
        if (this.graph.options.enricher.inputCondition) this.enrichInputCondition(element, conditions)

        // Enrich pruning
        this.enrichPruning(element, conditions)

        // Store enriched conditions
        element.conditions = conditions
    }

    /**
     * Auto-assign variability input as condition based on name
     */
    private enrichInputCondition(element: Element, conditions: LogicExpression[]) {
        const input = (this.graph.serviceTemplate.topology_template?.variability?.inputs || {})[element.id]
        if (check.isDefined(input)) conditions.push({variability_input: element.id})
    }

    private enrichPruning(element: Element, conditions: LogicExpression[]) {
        const candidates = [element.getTypeSpecificCondition(), ...element.getElementGenericCondition()]
        const selected = candidates.filter(wrapper => {
            // Ignore undefined
            if (check.isUndefined(wrapper)) return false

            // Add default condition if requested
            if (element.defaultEnabled && utils.isEmpty(conditions)) {
                // If targets consistency and if allowed
                if (wrapper.consistency && element.defaultConsistencyCondition) return true

                // If targets semantics and if allowed
                if (wrapper.semantic && element.defaultSemanticCondition) return true
            }

            // Add pruning condition if requested
            if (element.pruningEnabled) {
                // If targets consistency and if allowed
                if (wrapper.consistency && element.consistencyPruning) return true

                // If targets semantics and if allowed
                if (wrapper.semantic && element.semanticPruning) return true
            }

            // Otherwise
            return false
        })

        if (!utils.isEmpty(selected)) {
            conditions.unshift(
                generatify(
                    simplify(
                        andify(
                            selected.map(it => {
                                assert.isDefined(it)
                                return it.conditions
                            })
                        )
                    )
                )
            )
        }
    }
}
