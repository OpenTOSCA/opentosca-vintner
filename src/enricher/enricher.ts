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

        for (const element of this.graph.elements) {
            this.enrichConditions(element)
        }

        this.enrichConstraints()
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
        // TODO: why ignore elements without conditions?
        //if (utils.isEmpty(conditions)) return
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

        // Sanity check
        if (!(element.isRelation() || element.isArtifact()))
            throw new Error(`${element.Display} is not issued a manual id by the Condition Enricher`)

        this.graph.addConstraint({
            implies: [{and: [element.container.id, element.manualId]}, element.id],
        })
    }

    private enrichConstraints() {
        /**
         * Ensure that each relation source exists
         */
        if (this.graph.options.constraints.relationSource) {
            for (const relation of this.graph.relations) {
                this.graph.addConstraint({implies: [relation.id, relation.target.id]})
            }
        }

        /**
         * Ensure that each relation target exists
         */
        if (this.graph.options.constraints.relationTarget) {
            for (const relation of this.graph.relations) {
                this.graph.addConstraint({implies: [relation.id, relation.source.id]})
            }
        }

        // TODO: Ensure that artifacts are unique within their node (also considering non-present nodes)

        /**
         * Ensure that each artifact container exists
         */
        if (this.graph.options.constraints.artifactContainer) {
            for (const artifact of this.graph.artifacts)
                this.graph.addConstraint({implies: [artifact.id, artifact.container.id]})
        }

        /**
         * Ensure that each property container exists
         */
        if (this.graph.options.constraints.propertyContainer) {
            for (const property of this.graph.properties)
                this.graph.addConstraint({implies: [property.id, property.container.id]})
        }

        // TODO: Ensure that each property has maximum one value (also considering non-present nodes)

        /**
         * Ensure that each type container exists
         */
        if (this.graph.options.constraints.typeContainer) {
            for (const type of this.graph.types) this.graph.addConstraint({implies: [type.id, type.container.id]})
        }

        /**
         * Ensure that hosting stack exists
         * This prevents, e.g., the unexpected removal of the hosting stack.
         */
        if (this.graph.options.constraints.hostingStack) {
            for (const node of this.graph.nodes.filter(it => it.hasHost)) {
                const hostings = node.outgoing.filter(it => it.isHostedOn())
                const consequence = hostings.length === 1 ? hostings[0].id : {xor: hostings.map(it => it.id)}
                this.graph.addConstraint({
                    implies: [node.id, consequence],
                })
            }
        }

        // TODO: Ensure that each node has exactly one type

        // TODO: Ensure that every component has at maximum one hosting relation

        // TODO: Ensure that every component that had a hosting relation previously still has one

        // TODO: Ensure that every component that had an incoming relation previously still has one

        // TODO: Ensure that every component that had a deployment artifact previously still has one

        // TODO: enable/ disable flag for each constraint in variability.options
    }
}
