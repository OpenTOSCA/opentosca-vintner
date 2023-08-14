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
        return this.graph.options.default.policyDefaultConsistencyCondition
    }

    get defaultSemanticCondition() {
        return this.graph.options.default.policyDefaultSemanticCondition
    }

    get consistencyPruning() {
        return this.graph.options.pruning.policyConsistencyPruning
    }

    get semanticPruning() {
        return this.graph.options.pruning.policySemanticPruning
    }

    private _defaultCondition?: LogicExpression
    get defaultCondition(): LogicExpression {
        if (check.isUndefined(this._defaultCondition))
            this._defaultCondition = {has_present_target: this.toscaId, _cached_element: this}
        return this._defaultCondition
    }

    readonly defaultAlternativeCondition = undefined

    private getTypeSpecificDefaultCondition(): LogicExpression[] | undefined {
        // Not supported when conditional types are used
        if (this.types.length > 1) return

        const type = this.types[0]
        const conditions =
            this.graph.serviceTemplate.topology_template?.variability?.type_specific_conditions?.policy_types?.[
                type.name
            ]?.conditions
        if (check.isUndefined(conditions)) return

        return utils.copy(utils.toList(conditions))
    }

    private _presenceCondition?: LogicExpression
    get presenceCondition(): LogicExpression {
        if (check.isUndefined(this._presenceCondition)) {
            const typeSpecificConditions = this.getTypeSpecificDefaultCondition()
            if (check.isDefined(typeSpecificConditions)) {
                this._defaultCondition = {and: typeSpecificConditions}
                return this._defaultCondition
            }

            this._presenceCondition = {policy_presence: this.toscaId, _cached_element: this}
        }
        return this._presenceCondition
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
