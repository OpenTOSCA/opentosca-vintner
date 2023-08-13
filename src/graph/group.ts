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

    private getTypeSpecificDefaultCondition(): LogicExpression[] | undefined {
        // Not supported when conditional types are used
        if (this.types.length > 1) return

        const type = this.types[0]
        const conditions =
            this.graph.serviceTemplate.topology_template?.variability?.type_specific_conditions?.group_types?.[
                type.name
            ]?.conditions
        if (check.isUndefined(conditions)) return

        return utils.copy(utils.toList(conditions))
    }

    private _defaultCondition?: LogicExpression
    get defaultCondition(): LogicExpression {
        if (check.isUndefined(this._defaultCondition)) {
            const typeSpecificConditions = this.getTypeSpecificDefaultCondition()
            if (check.isDefined(typeSpecificConditions)) {
                this._defaultCondition = {and: typeSpecificConditions}
                return this._defaultCondition
            }

            this._defaultCondition = {has_present_member: this.toscaId, _cached_element: this}
        }
        return this._defaultCondition
    }

    private _presenceCondition?: LogicExpression
    get presenceCondition(): LogicExpression {
        if (check.isUndefined(this._presenceCondition))
            this._presenceCondition = {group_presence: this.toscaId, _cached_element: this}
        return this._presenceCondition
    }

    readonly defaultAlternativeCondition: undefined

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
