import * as check from '#check'
import {PolicyTemplate} from '#spec/policy-template'
import {LogicExpression} from '#spec/variability'
import * as utils from '#utils'
import Element from './element'
import Group from './group'
import Node from './node'
import Property from './property'
import Type from './type'

export default class Policy extends Element {
    readonly type = 'policy'
    readonly name: string
    readonly raw: PolicyTemplate
    readonly index: number

    readonly targets: (Node | Group)[] = []
    readonly properties: Property[] = []
    readonly propertiesMap: Map<String, Property[]> = new Map()
    readonly types: Type[] = []
    readonly typesMap: Map<String, Type[]> = new Map()

    constructor(data: {name: string; raw: PolicyTemplate; index: number}) {
        super()

        this.name = data.name
        this.raw = data.raw
        this.index = data.index
        this.conditions = utils.toList(data.raw.conditions)
    }

    get toscaId() {
        if (check.isDefined(this.index)) return this.index
        return this.name
    }

    get defaultEnabled() {
        return this.raw.default_condition ?? this.graph.options.default.policyDefaultCondition
    }

    get pruningEnabled() {
        return this.raw.pruning ?? this.graph.options.pruning.policyPruning
    }

    get defaultConsistencyCondition() {
        return this.raw.default_condition ?? this.graph.options.default.policyDefaultConsistencyCondition
    }

    get defaultSemanticCondition() {
        return this.raw.default_condition ?? this.graph.options.default.policyDefaultSemanticCondition
    }

    get consistencyPruning() {
        return this.raw.pruning ?? this.graph.options.pruning.policyConsistencyPruning
    }

    get semanticPruning() {
        return this.raw.pruning ?? this.graph.options.pruning.policySemanticPruning
    }

    getElementGenericCondition() {
        return {
            conditions: {has_present_target: this.toscaId, _cached_element: this},
            consistency: false,
            semantic: true,
        }
    }

    getTypeSpecificConditionWrapper() {
        // Not supported when conditional types are used
        if (this.types.length > 1) return
        const type = this.types[0]
        return this.graph.serviceTemplate.topology_template?.variability?.type_specific_conditions?.policy_types?.[
            type.name
        ]
    }

    constructPresenceCondition() {
        return {policy_presence: this.toscaId, _cached_element: this}
    }

    getTypeCondition(type: Type): LogicExpression {
        return {policy_type_presence: [this.toscaId, type.index], _cached_element: type}
    }

    getPropertyCondition(property: Property): LogicExpression {
        return {policy_property_presence: [this.toscaId, property.index ?? property.name], _cached_element: property}
    }

    isPolicy() {
        return true
    }
}
