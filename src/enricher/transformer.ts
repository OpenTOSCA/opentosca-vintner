import * as assert from '#assert'
import * as check from '#check'
import Graph from '#graph/graph'
import {GroupTemplateMap} from '#spec/group-template'
import {TopologyTemplate} from '#spec/topology-template'
import {LogicExpression, VariabilityAlternative} from '#spec/variability'
import * as utils from '#utils'

export default class Transformer {
    private readonly graph: Graph
    private readonly topology: TopologyTemplate

    constructor(graph: Graph) {
        this.graph = graph
        this.topology = graph.serviceTemplate.topology_template || {}
    }

    run() {
        // Clean elements from pruning options
        this.cleanElements()

        // Remove variability groups
        this.removeVariabilityGroups()

        // Clean variability definition from pruning options
        this.cleanVariabilityDefinition()
    }

    private removeVariabilityGroups() {
        if (check.isDefined(this.topology.groups)) {
            this.topology.groups = this.graph.groups
                .filter(it => !it.variability)
                .reduce<GroupTemplateMap>((map, group) => {
                    map[group.name] = group.raw
                    return map
                }, {})

            if (utils.isEmpty(this.topology.groups)) {
                delete this.topology.groups
            }
        }
    }

    private cleanElements() {
        this.graph.elements.forEach(it => {
            this.clean(it.raw)

            // TODO: what about non objects? e.g. non normalized requirement assignment
            this.cleanConditions(it.conditions)
            if (check.isObject(it.raw)) (it.raw as any).conditions = it.conditions
        })
    }

    private cleanConditions(conditions: LogicExpression[]) {
        assert.isArray(conditions)
        conditions.forEach(it => this._cleanCondition(it))
    }

    // TODO: clean condition
    private _cleanCondition(condition: LogicExpression[] | LogicExpression): void {
        if (!check.isObject(condition)) return

        if (check.isArray(condition)) return condition.forEach(it => this._cleanCondition(it))

        delete condition._cached_element

        const next = utils.firstValue(condition)
        if (check.isNumber(next)) return
        if (check.isString(next)) return

        // TODO: in theory might be _cached_element
        this._cleanCondition(next as any)
    }

    private clean(raw: VariabilityAlternative & {default_condition_mode?: string; consumed?: boolean}) {
        delete raw.default_condition
        delete raw.default_consistency_condition
        delete raw.default_semantic_condition
        delete raw.default_condition_mode

        delete raw.pruning
        delete raw.consistency_pruning
        delete raw.semantic_pruning

        delete raw.default_alternative

        delete raw.consumed
        delete raw.implied
    }

    private cleanVariabilityDefinition() {
        if (check.isUndefined(this.topology.variability)) return

        if (check.isDefined(this.topology.variability.options)) {
            // Delete pruning mode
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

            // Delete constraints options
            delete this.topology.variability.options.relation_source_constraint
            delete this.topology.variability.options.relation_target_constraint
            delete this.topology.variability.options.artifact_container_constraint
            delete this.topology.variability.options.property_container_constraint
            delete this.topology.variability.options.type_container_constraint
            delete this.topology.variability.options.hosting_stack_constraint
        }

        // Remove empty options
        if (utils.isEmpty(this.topology.variability.options)) delete this.topology.variability.options

        // Delete type-specific conditions variability definition
        delete this.topology.variability.type_specific_conditions

        // Remove empty variability
        if (utils.isEmpty(this.topology.variability)) delete this.topology.variability
    }
}
