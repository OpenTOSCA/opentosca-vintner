import * as check from '#check'
import {bratanize} from '#graph/utils'
import {RequirementAssignment} from '#spec/node-template'
import {RelationshipTemplate} from '#spec/relationship-template'
import {LogicExpression, RelationDefaultConditionMode} from '#spec/variability'
import * as utils from '#utils'
import {UnexpectedError} from '#utils/error'
import Element from './element'
import Group from './group'
import Node from './node'
import Property from './property'
import Type from './type'

export default class Relation extends Element {
    readonly type = 'relation'
    readonly name: string
    readonly raw: RequirementAssignment
    readonly index: number
    readonly container: Node

    readonly source: Node
    private _target?: Node
    set target(target: Node) {
        if (check.isDefined(this._target)) throw new Error(`Target of ${this.display} is already set`)
        this._target = target
    }

    get target() {
        if (check.isUndefined(this._target)) throw new Error(`Target of ${this.display} is not set`)
        return this._target
    }

    readonly groups: Group[] = []
    readonly properties: Property[] = []
    readonly propertiesMap: Map<String, Property[]> = new Map()

    private _relationship?: Relationship
    set relationship(relationship: Relationship) {
        if (check.isDefined(this._relationship)) throw new UnexpectedError()
        this._relationship = relationship
    }

    get relationship() {
        if (check.isUndefined(this._relationship)) throw new UnexpectedError()
        return this._relationship
    }

    hasRelationship() {
        return check.isDefined(this._relationship)
    }

    readonly types: Type[] = []
    readonly typesMap: Map<String, Type[]> = new Map()

    constructor(data: {name: string; raw: RequirementAssignment; container: Node; index: number}) {
        super()

        this.name = data.name
        this.raw = data.raw
        this.index = data.index
        this.container = data.container

        this.source = data.container
        this.conditions = check.isString(data.raw)
            ? []
            : check.isDefined(data.raw.default_alternative)
            ? [false]
            : utils.toList(data.raw.conditions)
        this.defaultAlternative = check.isString(data.raw) ? false : data.raw.default_alternative || false
    }

    get toscaId(): [string, string | number] {
        if (check.isDefined(this.index)) return [this.source.name, this.index]
        return [this.source.name, this.name]
    }

    get getDefaultMode(): RelationDefaultConditionMode {
        return (
            (check.isString(this.raw)
                ? this.graph.options.default.relation_default_condition_mode
                : this.raw.default_condition_mode) ??
            this.graph.options.default.relation_default_condition_mode ??
            'source-target'
        )
    }

    get defaultEnabled() {
        return Boolean(
            check.isString(this.raw)
                ? this.graph.options.default.relation_default_condition
                : this.raw.default_condition ?? this.graph.options.default.relation_default_condition
        )
    }

    get pruningEnabled() {
        return Boolean(
            check.isString(this.raw)
                ? this.graph.options.pruning.relation_pruning
                : this.raw.pruning ?? this.graph.options.pruning.relation_pruning
        )
    }

    private getTypeSpecificDefaultCondition(): LogicExpression[] | undefined {
        // Not supported when conditional types are used
        if (this.types.length > 1) return

        const type = this.types[0]
        const conditions =
            this.graph.serviceTemplate.topology_template?.variability?.type_specific_conditions?.relationship_types[
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

            const conditions: LogicExpression[] = []

            const mode = this.getDefaultMode
            mode.split('-').forEach(it => {
                if (it === 'source') {
                    return conditions.push(this.source.presenceCondition)
                }
                if (it === 'target') {
                    return conditions.push(this.target.presenceCondition)
                }

                throw new Error(`${this.Display} has unknown mode "${mode}" as default condition`)
            })

            if (utils.isEmpty(conditions)) throw new Error(`${this.Display} has no default condition`)

            if (conditions.length === 1) {
                this._defaultCondition = conditions[0]
            } else {
                this._defaultCondition = {and: conditions}
            }
        }
        return this._defaultCondition
    }

    private _presenceCondition?: LogicExpression
    get presenceCondition(): LogicExpression {
        if (check.isUndefined(this._presenceCondition))
            this._presenceCondition = {relation_presence: this.toscaId, _cached_element: this}
        return this._presenceCondition
    }

    // Check if no other relation having the same name is present
    private _defaultAlternativeCondition?: LogicExpression
    get defaultAlternativeCondition(): LogicExpression {
        if (check.isUndefined(this._defaultAlternativeCondition))
            this._defaultAlternativeCondition = bratanize(
                this.source.outgoingMap.get(this.name)!.filter(it => it !== this)
            )
        return this._defaultAlternativeCondition
    }

    getTypeCondition(type: Type): LogicExpression {
        return {relation_type_presence: [...this.toscaId, type.index], _cached_element: type}
    }

    getPropertyCondition(property: Property): LogicExpression {
        return {
            relation_property_presence: [...this.toscaId, property.index ?? property.name],
            _cached_element: property,
        }
    }

    isHostedOn() {
        return new RegExp(/^(.*_)?host(_.*)?$/).test(this.name)
    }

    isConnectsTo() {
        return new RegExp(/^(.*_)?connection(_.*)?$/).test(this.name)
    }

    isRelation() {
        return true
    }
}

export class Relationship {
    readonly type = 'relationship'
    readonly raw: RelationshipTemplate
    readonly id: string
    readonly name: string
    readonly relation: Relation

    constructor(data: {name: string; raw: RelationshipTemplate; relation: Relation}) {
        this.name = data.name
        this.relation = data.relation
        this.raw = data.raw
        this.id = this.type + '.' + this.name
    }
}
