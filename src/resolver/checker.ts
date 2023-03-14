import {Graph} from '#/resolver/graph'
import {ConsistencyOptions} from '#spec/variability'

export default class Checker {
    private readonly graph: Graph
    private readonly options: ConsistencyOptions

    constructor(graph: Graph) {
        this.graph = graph
        this.options = graph.serviceTemplate.topology_template?.variability?.options || {}
    }

    run() {
        if (this.options.disable_consistency_checks) return

        const relations = this.graph.relations.filter(relation => relation.present)
        const nodes = this.graph.nodes.filter(node => node.present)

        // Ensure that each relation source exists
        if (!this.options.disable_relation_source_consistency_check) {
            for (const relation of relations) {
                if (!relation.source.present)
                    throw new Error(`Relation source "${relation.source.name}" of ${relation.display} does not exist`)
            }
        }

        // Ensure that each relation target exists
        if (!this.options.disable_relation_target_consistency_check) {
            for (const relation of relations) {
                if (!relation.target.present)
                    throw new Error(`Relation target "${relation.target.name}" of ${relation.display} does not exist`)
            }
        }

        // Ensure that every component has at maximum one hosting relation
        if (!this.options.disable_ambiguous_hosting_consistency_check) {
            for (const node of nodes) {
                const relations = node.outgoing.filter(
                    relation => relation.source.name === node.name && relation.name === 'host' && relation.present
                )
                if (relations.length > 1) throw new Error(`${node.Display} has more than one hosting relations`)
            }
        }

        // Ensure that every component that had a hosting relation previously still has one
        if (!this.options.disable_expected_hosting_consistency_check) {
            for (const node of nodes) {
                const relations = node.outgoing.filter(
                    relation => relation.source.name === node.name && relation.name === 'host'
                )

                if (relations.length !== 0 && !relations.some(relation => relation.present))
                    throw new Error(`${node.Display} requires a hosting relation`)
            }
        }

        // Ensure that node of each artifact exists
        if (!this.options.disable_missing_artifact_parent_consistency_check) {
            const artifacts = this.graph.artifacts.filter(artifact => artifact.present)
            for (const artifact of artifacts) {
                if (!artifact.container.present) throw new Error(`Container of ${artifact.display} does not exist`)
            }
        }

        // Ensure that artifacts are unique within their node (also considering non-present nodes)
        if (!this.options.disable_ambiguous_artifact_consistency_check) {
            for (const node of this.graph.nodes) {
                const names = new Set()
                for (const artifact of node.artifacts.filter(artifact => artifact.present)) {
                    if (names.has(artifact.name)) throw new Error(`${artifact.Display} is ambiguous`)
                    names.add(artifact.name)
                }
            }
        }

        // Ensure that node of each present property exists
        if (!this.options.disable_missing_property_parent_consistency_check) {
            for (const property of this.graph.properties.filter(property => property.present)) {
                if (!property.container.present) {
                    throw new Error(`Container of ${property.display} does not exist`)
                }
            }
        }

        // Ensure that each property has maximum one value (also considering non-present nodes)
        if (!this.options.disable_ambiguous_property_consistency_check) {
            for (const node of this.graph.nodes) {
                const names = new Set()
                for (const property of node.properties.filter(property => property.present)) {
                    if (names.has(property.name)) throw new Error(`${property.Display} is ambiguous`)
                    names.add(property.name)
                }
            }
        }
    }
}
