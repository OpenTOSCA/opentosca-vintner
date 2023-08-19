import * as check from '#check'
import {GroupTemplate} from '#spec/group-template'
import {TOSCA_GROUP_TYPES} from '#spec/group-type'
import {LogicExpression} from '#spec/variability'
import * as utils from '#utils'
import Element from './element'
import Node from './node'
import Property from './property'
import Relation from './relation'
import Type from './type'

export default class Group extends Element {
    readonly type = 'group'
    readonly name: string
    readonly raw: GroupTemplate

    readonly members: (Node | Relation)[] = []
    readonly properties: Property[] = []
    readonly propertiesMap: Map<String, Property[]> = new Map()
    readonly variability: boolean
    readonly types: Type[] = []
    readonly typesMap: Map<String, Type[]> = new Map()

    constructor(data: {name: string; raw: GroupTemplate}) {
        super()

        this.name = data.name
        this.raw = data.raw
        this.conditions = utils.toList(data.raw.conditions)
        this.variability =
            check.isString(this.raw.type) &&
            (this.raw.type === TOSCA_GROUP_TYPES.VARIABILITY_GROUPS_ROOT ||
                this.raw.type === TOSCA_GROUP_TYPES.VARIABILITY_GROUPS_CONDITIONAL_MEMBERS)
    }

    get toscaId() {
        return this.name
    }

    get defaultEnabled() {
        return this.raw.default_condition ?? this.graph.options.default.groupDefaultCondition
    }

    get pruningEnabled() {
        return this.raw.pruning ?? this.graph.options.pruning.groupPruning
    }

    get defaultConsistencyCondition() {
        return (
            this.raw.default_consistency_condition ??
            this.raw.default_condition ??
            this.graph.options.default.groupDefaultConsistencyCondition
        )
    }

    get defaultSemanticCondition() {
        return (
            this.raw.default_semantic_condition ??
            this.raw.default_condition ??
            this.graph.options.default.groupDefaultSemanticCondition
        )
    }

    get consistencyPruning() {
        return this.raw.consistency_pruning ?? this.raw.pruning ?? this.graph.options.pruning.groupConsistencyPruning
    }

    get semanticPruning() {
        return this.raw.semantic_pruning ?? this.raw.pruning ?? this.graph.options.pruning.groupSemanticPruning
    }

    getTypeSpecificConditionWrapper() {
        // Not supported when conditional types are used
        if (this.types.length > 1) return
        const type = this.types[0]
        return this.graph.serviceTemplate.topology_template?.variability?.type_specific_conditions?.group_types?.[
            type.name
        ]
    }

    getElementGenericCondition() {
        return {
            conditions: {has_present_member: this.toscaId, _cached_element: this},
            consistency: false,
            semantic: true,
        }
    }

    constructPresenceCondition() {
        return {group_presence: this.toscaId, _cached_element: this}
    }

    getTypeCondition(type: Type): LogicExpression {
        return {group_type_presence: [this.toscaId, type.index], _cached_element: type}
    }

    getPropertyCondition(property: Property): LogicExpression {
        return {group_property_presence: [this.toscaId, property.index ?? property.name], _cached_element: property}
    }

    isGroup() {
        return true
    }
}
