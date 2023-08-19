import * as check from '#check'
import {bratanize} from '#graph/utils'
import {GroupTemplate} from '#spec/group-template'
import {NodeTemplate} from '#spec/node-template'
import {PolicyTemplate} from '#spec/policy-template'
import {RelationshipTemplate} from '#spec/relationship-template'
import {TypeAssignment} from '#spec/type-assignment'
import * as utils from '#utils'
import {UnexpectedError} from '#utils/error'
import Element from './element'
import Group from './group'
import Node from './node'
import Policy from './policy'
import Relation from './relation'

export type TypeContainer = Node | Relation | Policy | Group
export type TypeContainerTemplate = NodeTemplate | RelationshipTemplate | PolicyTemplate | GroupTemplate

export default class Type extends Element {
    readonly type = 'type'
    readonly name: string
    readonly raw: TypeAssignment | string
    readonly index: number
    readonly container: TypeContainer

    constructor(data: {name: string; container: TypeContainer; index: number; raw: TypeAssignment | string}) {
        super()

        this.name = data.name
        this.raw = data.raw
        this.index = data.index
        this.container = data.container

        this.conditions = check.isString(data.raw)
            ? []
            : check.isDefined(data.raw.default_alternative)
            ? [false]
            : utils.toList(data.raw.conditions)
        this.defaultAlternative = check.isString(data.raw) ? false : data.raw.default_alternative || false
    }

    get toscaId() {
        if (check.isUndefined(this.index)) throw new UnexpectedError()
        if (check.isString(this.container.toscaId)) return [this.container.toscaId, this.index]
        if (check.isNumber(this.container.toscaId)) return [this.container.toscaId, this.index]
        return [...this.container.toscaId, this.index]
    }

    get defaultEnabled() {
        if (check.isString(this.raw)) return this.graph.options.default.typeDefaultCondition
        return this.raw.default_condition ?? this.graph.options.default.typeDefaultCondition
    }

    get pruningEnabled() {
        if (check.isString(this.raw)) return this.graph.options.pruning.typePruning
        return this.raw.pruning ?? this.graph.options.pruning.typePruning
    }

    get defaultConsistencyCondition() {
        if (check.isString(this.raw)) return this.graph.options.default.typeDefaultConsistencyCondition
        return (
            this.raw.default_consistency_condition ??
            this.raw.default_condition ??
            this.graph.options.default.typeDefaultConsistencyCondition
        )
    }

    get defaultSemanticCondition() {
        if (check.isString(this.raw)) return this.graph.options.default.typeDefaultSemanticCondition
        return (
            this.raw.default_semantic_condition ??
            this.raw.default_condition ??
            this.graph.options.default.typeDefaultSemanticCondition
        )
    }

    get consistencyPruning() {
        if (check.isString(this.raw)) return this.graph.options.pruning.typeConsistencyPruning
        return this.raw.consistency_pruning ?? this.raw.pruning ?? this.graph.options.pruning.typeConsistencyPruning
    }

    get semanticPruning() {
        if (check.isString(this.raw)) return this.graph.options.pruning.typeSemanticPruning
        return this.raw.semantic_pruning ?? this.raw.pruning ?? this.graph.options.pruning.typeSemanticPruning
    }

    getElementGenericCondition() {
        return {
            conditions: this.container.presenceCondition,
            consistency: true,
            semantic: false,
        }
    }

    constructPresenceCondition() {
        return this.container.getTypeCondition(this)
    }

    // Check if no other type is present
    constructDefaultAlternativeCondition() {
        return bratanize(this.container.types.filter(it => it !== this))
    }

    isType() {
        return true
    }
}
