import Graph from '#/graph/graph'
import * as utils from '#utils'

export default class Checker {
    private readonly graph: Graph

    constructor(graph: Graph) {
        this.graph = graph
    }

    run() {
        const relations = this.graph.relations.filter(it => it.present)
        const nodes = this.graph.nodes.filter(it => it.present)
        const artifacts = this.graph.artifacts.filter(it => it.present)
        const properties = this.graph.properties.filter(it => it.present)
        const types = this.graph.types.filter(it => it.present)

        // Ensure that each relation source exists
        if (this.graph.options.consistency.relation_source_consistency_check) {
            for (const relation of relations) {
                if (!relation.source.present)
                    throw new Error(`Relation source "${relation.source.name}" of ${relation.display} does not exist`)
            }
        }

        // Ensure that each relation target exists
        if (this.graph.options.consistency.relation_target_consistency_check) {
            for (const relation of relations) {
                if (!relation.target.present)
                    throw new Error(`Relation target "${relation.target.name}" of ${relation.display} does not exist`)
            }
        }

        // Ensure that every component has at maximum one hosting relation
        if (this.graph.options.consistency.ambiguous_hosting_consistency_check) {
            for (const node of nodes) {
                const relations = node.outgoing.filter(
                    relation => relation.source.name === node.name && relation.isHostedOn() && relation.present
                )
                if (relations.length > 1) throw new Error(`${node.Display} has more than one hosting relations`)
            }
        }

        // Ensure that every component that had a hosting relation previously still has one
        if (this.graph.options.consistency.expected_hosting_consistency_check) {
            for (const node of nodes) {
                const relations = node.outgoing.filter(
                    relation => relation.source.name === node.name && relation.isHostedOn()
                )

                if (relations.length !== 0 && !relations.some(relation => relation.present))
                    throw new Error(`${node.Display} requires a hosting relation`)
            }
        }

        // Ensure that node of each artifact exists
        if (this.graph.options.consistency.missing_artifact_parent_consistency_check) {
            for (const artifact of artifacts) {
                if (!artifact.container.present) throw new Error(`Container of ${artifact.display} does not exist`)
            }
        }

        // Ensure that artifacts are unique within their node (also considering non-present nodes)
        if (this.graph.options.consistency.ambiguous_artifact_consistency_check) {
            for (const node of nodes) {
                const names = new Set()
                for (const artifact of artifacts) {
                    if (names.has(artifact.name)) throw new Error(`${artifact.Display} is ambiguous`)
                    names.add(artifact.name)
                }
            }
        }

        // Ensure that node of each present property exists
        if (this.graph.options.consistency.missing_property_parent_consistency_check) {
            for (const property of properties) {
                if (!property.container.present) {
                    throw new Error(`Container of ${property.display} does not exist`)
                }
            }
        }

        // Ensure that each property has maximum one value (also considering non-present nodes)
        if (this.graph.options.consistency.ambiguous_property_consistency_check) {
            for (const node of nodes) {
                const names = new Set()
                for (const property of node.properties.filter(it => it.present)) {
                    if (names.has(property.name)) throw new Error(`${property.Display} is ambiguous`)
                    names.add(property.name)
                }
            }
        }

        // Ensure that container of each type exists
        if (this.graph.options.consistency.missing_type_container_consistency_check) {
            for (const type of types) {
                if (!type.container.present) throw new Error(`Container of ${type.display} does not exist`)
            }
        }

        // Ensure that each node has exactly one type
        if (this.graph.options.consistency.ambiguous_type_consistency_check) {
            for (const node of nodes) {
                const names = new Set()
                const types = node.types.filter(property => property.present)
                if (utils.isEmpty(types)) throw new Error(`${node.Display} has no type`)
                for (const type of types) {
                    if (names.has(type.name)) throw new Error(`${type.Display} is ambiguous`)
                    names.add(type.name)
                }
            }
        }
    }
}
