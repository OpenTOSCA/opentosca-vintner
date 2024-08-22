import * as check from '#check'
import Artifact from '#graph/artifact'
import Element from '#graph/element'
import Graph from '#graph/graph'
import {generatify, orify, simplify} from '#graph/utils'
import {LogicExpression} from '#spec/variability'
import {destructImplementationName} from '#technologies/utils'
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

        /**
         * Artifact pruning conditions
         */
        // TODO: merge this somehow in the general pruning world by "pruning plugins"?
        if (this.graph.options.enricher.artifacts) {
            for (const artifact of this.graph.artifacts) {
                this.enrichArtifact(artifact)
            }
        }
    }

    private enrichArtifact(artifact: Artifact) {
        const conditions: LogicExpression[] = []
        for (const technology of artifact.container.technologies) {
            const deconstructed = destructImplementationName(technology.assign)
            if (check.isUndefined(deconstructed.artifact)) continue
            if (!artifact.getType().isA(deconstructed.artifact)) continue
            conditions.push(technology.presenceCondition)
        }
        artifact.conditions.push(generatify(orify(conditions)))
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
