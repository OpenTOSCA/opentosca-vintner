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
     * If requests, then the manual condition of an element implies this element
     * This ensures, e.g., that a relation is present under a given condition while using incoming-host
     *
     * This is most likely only relevant for relations.
     * However, the method is still written in a generic way.
     */
    private enrichImplications(element: Element) {
        if (check.isUndefined(element.container)) return
        if (!element.implied) return

        let left
        if (element.implied === 'TARGET') {
            assert.isRelation(element)
            left = element.target.id
        }
        if (element.implied === 'SOURCE' || element.implied === 'CONTAINER' || check.isTrue(element.implied)) {
            left = element.container.id
        }
        assert.isDefined(left, 'Left not defined')

        // Sanity check
        if (!(element.isRelation() || element.isArtifact()))
            throw new Error(`${element.Display} is not issued a manual id`)

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

        /**
         * Ensure that technology exists
         */
        if (this.graph.options.constraints.technology) {
            for (const node of this.graph.nodes.filter(it => !utils.isEmpty(it.technologies))) {
                const consequence =
                    node.technologies.length === 1 ? node.technologies[0].id : {xor: node.technologies.map(it => it.id)}
                this.graph.addConstraint({
                    implies: [node.id, consequence],
                })
            }
        }
    }
}
