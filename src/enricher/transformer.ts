import * as check from '#check'
import Graph from '#graph/graph'
import {TopologyTemplate} from '#spec/topology-template'
import {VariabilityAlternative} from '#spec/variability'

export default class Transformer {
    private readonly graph: Graph
    private readonly topology: TopologyTemplate

    constructor(graph: Graph) {
        this.graph = graph
        this.topology = graph.serviceTemplate.topology_template || {}
    }

    run() {
        // Transform elements
        this.transformElements()

        // Transform variability definition
        this.transformVariabilityDefinition()
    }

    private transformElements() {
        this.graph.elements.forEach(it => {
            // TODO: clean
            // this.clean(it.raw)
        })
    }

    private clean(raw: VariabilityAlternative & {default_condition_mode?: string}) {
        delete raw.default_condition
        delete raw.default_consistency_condition
        delete raw.default_semantic_condition
        delete raw.default_condition_mode

        delete raw.pruning
        delete raw.consistency_pruning
        delete raw.semantic_pruning
    }

    private transformVariabilityDefinition() {
        if (check.isUndefined(this.topology.variability)) return

        // Delete type-specific conditions variability definition
        delete this.topology.variability.type_specific_conditions

        if (check.isUndefined(this.topology.variability.options)) return

        // Delete resolving mode
        delete this.topology.variability.options.mode

        // Delete default options
        delete this.topology.variability.options.default_condition

        delete this.topology.variability.options.node_default_condition
        delete this.topology.variability.options.node_default_condition_mode
        delete this.topology.variability.options.node_default_consistency_condition
        delete this.topology.variability.options.node_default_semantic_condition

        delete this.topology.variability.options.relation_default_condition
        delete this.topology.variability.options.relation_default_condition_mode
        delete this.topology.variability.options.relation_default_consistency_condition
        delete this.topology.variability.options.relation_default_semantic_condition

        delete this.topology.variability.options.policy_default_condition
        delete this.topology.variability.options.policy_default_consistency_condition
        delete this.topology.variability.options.policy_default_semantic_condition

        delete this.topology.variability.options.group_default_condition
        delete this.topology.variability.options.group_default_consistency_condition
        delete this.topology.variability.options.group_default_semantic_condition

        delete this.topology.variability.options.artifact_default_condition
        delete this.topology.variability.options.artifact_default_consistency_condition
        delete this.topology.variability.options.artifact_default_semantic_condition

        delete this.topology.variability.options.property_default_condition
        delete this.topology.variability.options.property_default_consistency_condition
        delete this.topology.variability.options.property_default_semantic_condition

        delete this.topology.variability.options.type_default_condition
        delete this.topology.variability.options.type_default_consistency_condition
        delete this.topology.variability.options.type_default_semantic_condition

        // Delete pruning options
        delete this.topology.variability.options.pruning
        delete this.topology.variability.options.consistency_pruning
        delete this.topology.variability.options.semantic_pruning

        delete this.topology.variability.options.node_pruning
        delete this.topology.variability.options.node_consistency_pruning
        delete this.topology.variability.options.node_semantic_pruning

        delete this.topology.variability.options.relation_pruning
        delete this.topology.variability.options.relation_consistency_pruning
        delete this.topology.variability.options.relation_semantic_pruning

        delete this.topology.variability.options.policy_pruning
        delete this.topology.variability.options.policy_consistency_pruning
        delete this.topology.variability.options.policy_semantic_pruning

        delete this.topology.variability.options.group_pruning
        delete this.topology.variability.options.group_consistency_pruning
        delete this.topology.variability.options.group_semantic_pruning

        delete this.topology.variability.options.artifact_pruning
        delete this.topology.variability.options.artifact_consistency_pruning
        delete this.topology.variability.options.artifact_semantic_pruning

        delete this.topology.variability.options.property_pruning
        delete this.topology.variability.options.property_consistency_pruning
        delete this.topology.variability.options.property_semantic_pruning

        delete this.topology.variability.options.type_pruning
        delete this.topology.variability.options.type_consistency_pruning
        delete this.topology.variability.options.type_semantic_pruning
    }
}
