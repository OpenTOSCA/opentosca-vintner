import * as check from '#check'
import {bratify} from '#graph/utils'
import {ExtendedRequirementAssignment} from '#spec/node-template'
import {RelationshipTemplate} from '#spec/relationship-template'
import {LogicExpression, RelationDefaultConditionMode} from '#spec/variability'
import * as utils from '#utils'
import Element from './element'
import Group from './group'
import Node from './node'
import Property from './property'
import Type from './type'

export default class Relation extends Element {
    readonly type = 'relation'
    readonly name: string
    readonly raw: ExtendedRequirementAssignment
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
        if (check.isDefined(this._relationship)) throw new Error(`${this.Display} already has a relationship`)
        this._relationship = relationship
    }

    get relationship() {
        if (check.isUndefined(this._relationship)) throw new Error(`${this.Display} has no relationship`)
        return this._relationship
    }

    hasRelationship() {
        return check.isDefined(this._relationship)
    }

    readonly types: Type[] = []
    readonly typesMap: Map<String, Type[]> = new Map()

    constructor(data: {name: string; raw: ExtendedRequirementAssignment; container: Node; index: number}) {
        super()

        this.name = data.name
        this.raw = data.raw
        this.index = data.index
        this.container = data.container

        this.source = data.container
        this.conditions = check.isDefined(data.raw.default_alternative) ? [false] : utils.toList(data.raw.conditions)
        this.defaultAlternative = data.raw.default_alternative ?? false
    }

    get toscaId(): [string, string | number] {
        return [this.source.name, this.index]
    }

    get getDefaultMode(): RelationDefaultConditionMode {
        return this.raw.default_condition_mode ?? this.graph.options.default.relationDefaultConditionMode
    }

    get defaultEnabled() {
        return this.raw.default_condition ?? this.graph.options.default.relationDefaultCondition
    }

    get pruningEnabled() {
        return this.raw.pruning ?? this.graph.options.pruning.relationPruning
    }

    get defaultConsistencyCondition() {
        return (
            this.raw.default_consistency_condition ??
            this.raw.default_condition ??
            this.graph.options.default.relationDefaultConsistencyCondition
        )
    }

    get defaultSemanticCondition() {
        return (
            this.raw.default_semantic_condition ??
            this.raw.default_condition ??
            this.graph.options.default.relationDefaultSemanticCondition
        )
    }

    get consistencyPruning() {
        return this.raw.consistency_pruning ?? this.raw.pruning ?? this.graph.options.pruning.relationConsistencyPruning
    }

    get semanticPruning() {
        return this.raw.semantic_pruning ?? this.raw.pruning ?? this.graph.options.pruning.relationSemanticPruning
    }

    getTypeSpecificConditionWrapper() {
        // Not supported when conditional types are used
        if (this.types.length > 1) return
        const type = this.types[0]
        return this.graph.getTypeSpecificConditions()?.relationship_types?.[type.name]
    }

    getElementGenericCondition() {
        const conditions: LogicExpression[] = []

        const mode = this.getDefaultMode
        mode.split('-').forEach(it => {
            if (!['source', 'target'].includes(it))
                throw new Error(`${this.Display} has unknown mode "${mode}" as default condition`)

            if (it === 'source') {
                return conditions.push(this.source.presenceCondition)
            }
            if (it === 'target') {
                return conditions.push(this.target.presenceCondition)
            }
        })

        return {conditions: {and: conditions}, consistency: true, semantic: false}
    }

    constructPresenceCondition() {
        return {relation_presence: this.toscaId, _cached_element: this}
    }

    // Check if no other relation having the same name is present
    constructDefaultAlternativeCondition(): LogicExpression {
        return bratify(this.source.outgoingMap.get(this.name)!.filter(it => it !== this))
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

    get implied() {
        return this.raw.implied ?? this.graph.options.default.relationDefaultImplied
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
