import * as assert from '#assert'
import * as check from '#check'
import Element from '#graph/element'
import Graph from '#graph/graph'
import * as utils from '#utils'

export class ConstraintEnricher {
    private readonly graph: Graph

    constructor(graph: Graph) {
        this.graph = graph
    }

    run() {
        this.enrichConstraints()

        for (const element of this.graph.elements) {
            this.enrichImplications(element)
        }
    }

    /**
     * If modeled, then the manual condition of an element implies this element
     * This ensures, e.g., that a relation is present under a given condition while using incoming-host
     *
     * This is most likely only relevant for relations and properties.
     * However, the method is still written in a generic way.
     */
    // TODO: move stuff into the classes ...
    private enrichImplications(element: Element) {
        if (!element.implied) return

        /**
         * Imply nodes
         */
        if (element.isNode()) {
            return this.graph.addConstraint({
                implies: [element.manualId, element.id],
            })
        }

        /**
         * Imply properties
         */
        // TODO: add "relation_enhanced_implication_mode"
        if (element.isProperty()) {
            if (utils.isEmpty(element.consuming)) return

            // TODO: make this an option
            if (check.isUndefined(element.consuming.find(it => it.isInput()))) return

            return this.graph.addConstraint({
                implies: [
                    {and: [element.container.id, element.manualId, {or: element.consuming.map(it => it.manualId)}]},
                    element.id,
                ],
            })
        }

        /**
         * Enhanced implied relations
         */
        if (element.isRelation() && this.graph.options.constraints.relationEnhancedImplication) {
            return this.graph.addConstraint({
                implies: [{and: [element.container.id, element.manualId, element.target.manualId]}, element.id],
            })
        }

        /**
         * Element presence is implied by container presence and manual conditions
         */
        if (check.isUndefined(element.container)) return

        // TODO: dead code for early returns from above
        let left
        if (element.implied === 'TARGET') {
            assert.isRelation(element)
            left = element.target.id
        }
        if (element.implied === 'SOURCE' || element.implied === 'CONTAINER' || check.isTrue(element.implied)) {
            left = element.container.id
        }
        assert.isDefined(left, 'Left not defined')

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

        /**
         * Ensure that artifacts are unique within their node (also considering non-present nodes)
         */
        if (this.graph.options.constraints.uniqueArtifact) {
            for (const node of this.graph.nodes) {
                for (const artifacts of node.artifactsMap.values()) {
                    this.graph.addConstraint({amo: artifacts.map(it => it.id)})
                }
            }
        }

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

        /**
         * Ensure that each property has at most one value
         */
        if (this.graph.options.constraints.uniqueProperty) {
            for (const element of [
                ...this.graph.nodes,
                ...this.graph.relations,
                ...this.graph.policies,
                ...this.graph.groups,
                ...this.graph.artifacts,
            ]) {
                for (const properties of element.propertiesMap.values()) {
                    this.graph.addConstraint({amo: properties.map(it => it.id)})
                }
            }
        }

        /**
         * Ensure that each type container exists
         */
        if (this.graph.options.constraints.typeContainer) {
            for (const type of this.graph.types) {
                this.graph.addConstraint({implies: [type.id, type.container.id]})
            }
        }

        /**
         * Ensure that hosting stack exists
         */
        if (this.graph.options.constraints.requiredHosting) {
            for (const node of this.graph.nodes.filter(it => it.hasHost)) {
                const hostings = node.outgoing.filter(it => it.isHostedOn())
                const consequence = hostings.length === 1 ? hostings[0].id : {exo: hostings.map(it => it.id)}
                this.graph.addConstraint({implies: [node.id, consequence]})
            }
        }

        // TODO: Ensure that each node has exactly one type

        /**
         * Ensure that every component has at maximum one hosting relation
         */
        if (this.graph.options.constraints.singleHosting) {
            for (const node of this.graph.nodes) {
                this.graph.addConstraint({amo: node.outgoing.filter(it => it.isHostedOn()).map(it => it.id)})
            }
        }

        // TODO: Ensure that every component that had a hosting relation previously still has one

        /**
         * Ensure that every component that had an incoming relation previously still has one
         */
        if (this.graph.options.constraints.requiredIncomingRelation) {
            for (const node of this.graph.nodes) {
                if (utils.isEmpty(node.ingoing)) continue
                const consequence = {or: node.ingoing.map(it => it.id)}
                this.graph.addConstraint({implies: [node.id, consequence]})
            }
        }

        /**
         * Ensure that every component that had a deployment artifact previously still has one
         */
        if (this.graph.options.constraints.requiredArtifact) {
            for (const node of this.graph.nodes) {
                if (utils.isEmpty(node.artifacts)) continue
                const consequence = {exo: node.artifacts.map(it => it.id)}
                this.graph.addConstraint({implies: [node.id, consequence]})
            }
        }

        /**
         * Ensure that required technology exists (required and single)
         */
        // .filter(it => utils.isPopulated(it.technologies)
        if (this.graph.options.constraints.requiredTechnology) {
            for (const node of this.graph.nodes.filter(it => it.managed)) {
                const consequence =
                    node.technologies.length === 1 ? node.technologies[0].id : {exo: node.technologies.map(it => it.id)}
                this.graph.addConstraint({implies: [node.id, consequence]})
            }
        }

        /**
         * Ensure that technology is unique
         */
        if (this.graph.options.constraints.uniqueTechnology) {
            for (const node of this.graph.nodes.filter(it => it.managed)) {
                this.graph.addConstraint({amo: node.technologies.map(it => it.id)})
            }
        }

        /**
         * Ensure that inputs are unique per name
         */
        if (this.graph.options.constraints.uniqueInput) {
            for (const inputs of this.graph.inputsMap.values()) {
                this.graph.addConstraint({amo: inputs.map(it => it.id)})
            }
        }

        // TODO: Ensure that inputs are consumed (not required due to pruning?)

        /**
         * Ensure that outputs are unique per name
         */
        if (this.graph.options.constraints.uniqueOutput) {
            for (const outputs of this.graph.outputsMap.values()) {
                this.graph.addConstraint({amo: outputs.map(it => it.id)})
            }
        }

        // TODO: Ensure that outputs are produced (not required due to pruning?)

        /**
         * Ensure that relations are unique per name
         */
        if (this.graph.options.constraints.uniqueRelation) {
            for (const node of this.graph.nodes) {
                for (const [_name, relations] of node.outgoingMap) {
                    const consequence = {amo: relations.map(it => it.id)}
                    this.graph.addConstraint({implies: [node.id, consequence]})
                }
            }
        }
    }
}
