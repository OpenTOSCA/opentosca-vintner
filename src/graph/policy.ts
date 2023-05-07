import {PolicyTemplate} from '#spec/policy-template'
import * as utils from '#utils'
import * as validator from '#validator'
import {LogicExpression} from '#spec/variability'
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
        if (validator.isDefined(this.index)) return this.index
        return this.name
    }

    get defaultEnabled() {
        return Boolean(this.raw.default_condition ?? this.graph.options.default.policy_default_condition)
    }

    get pruningEnabled() {
        return Boolean(this.raw.pruning ?? this.graph.options.pruning.policy_pruning)
    }

    private _defaultCondition?: LogicExpression
    get defaultCondition(): LogicExpression {
        if (validator.isUndefined(this._defaultCondition))
            this._defaultCondition = {has_present_target: this.toscaId, _cached_element: this}
        return this._defaultCondition
    }

    readonly defaultAlternativeCondition = undefined

    private _presenceCondition?: LogicExpression
    get presenceCondition(): LogicExpression {
        if (validator.isUndefined(this._presenceCondition))
            this._presenceCondition = {policy_presence: this.toscaId, _cached_element: this}
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
