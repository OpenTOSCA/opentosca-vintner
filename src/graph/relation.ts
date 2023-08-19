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
        if (check.isString(this.raw)) return this.graph.options.default.relationDefaultConditionMode
        return this.raw.default_condition_mode ?? this.graph.options.default.relationDefaultConditionMode
    }

    get defaultEnabled() {
        if (check.isString(this.raw)) return this.graph.options.default.relationDefaultCondition
        return this.raw.default_condition ?? this.graph.options.default.relationDefaultCondition
    }

    get pruningEnabled() {
        if (check.isString(this.raw)) return this.graph.options.pruning.relationPruning
        return this.raw.pruning ?? this.graph.options.pruning.relationPruning
    }

    get defaultConsistencyCondition() {
        if (check.isString(this.raw)) return this.graph.options.default.relationDefaultConsistencyCondition
        return this.raw.default_condition ?? this.graph.options.default.relationDefaultConsistencyCondition
    }

    get defaultSemanticCondition() {
        if (check.isString(this.raw)) return this.graph.options.default.relationDefaultSemanticCondition
        return this.raw.default_condition ?? this.graph.options.default.relationDefaultSemanticCondition
    }

    get consistencyPruning() {
        if (check.isString(this.raw)) return this.graph.options.pruning.relationConsistencyPruning
        return this.raw.pruning ?? this.graph.options.pruning.relationConsistencyPruning
    }

    get semanticPruning() {
        if (check.isString(this.raw)) return this.graph.options.pruning.relationSemanticPruning
        return this.raw.pruning ?? this.graph.options.pruning.relationSemanticPruning
    }

    getTypeSpecificConditionWrapper() {
        // Not supported when conditional types are used
        if (this.types.length > 1) return
        const type = this.types[0]
        return this.graph.serviceTemplate.topology_template?.variability?.type_specific_conditions
            ?.relationship_types?.[type.name]
    }

    getElementGenericCondition() {
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

        return {conditions, consistency: true, semantic: false}
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
