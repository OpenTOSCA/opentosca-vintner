import {TypeAssignment} from '#spec/type-assignment'
import * as validator from '#validator'
import * as utils from '#utils'
import {UnexpectedError} from '#utils/error'
import {LogicExpression} from '#spec/variability'
import Node from './node'
import Relation from './relation'
import Policy from './policy'
import Group from './group'
import Element from './element'
import {bratanize} from '#graph/utils'
import {NodeTemplate} from '#spec/node-template'
import {RelationshipTemplate} from '#spec/relationship-template'
import {PolicyTemplate} from '#spec/policy-template'
import {GroupTemplate} from '#spec/group-template'

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

        this.conditions = validator.isString(data.raw)
            ? []
            : validator.isDefined(data.raw.default_alternative)
            ? [false]
            : utils.toList(data.raw.conditions)
        this.defaultAlternative = validator.isString(data.raw) ? false : data.raw.default_alternative || false
    }

    get toscaId() {
        if (validator.isUndefined(this.index)) throw new UnexpectedError()
        if (validator.isString(this.container.toscaId)) return [this.container.toscaId, this.index]
        if (validator.isNumber(this.container.toscaId)) return [this.container.toscaId, this.index]
        return [...this.container.toscaId, this.index]
    }

    get defaultEnabled() {
        return Boolean(
            validator.isString(this.raw)
                ? this.graph.options.default.type_default_condition
                : this.raw.default_condition ?? this.graph.options.default.type_default_condition
        )
    }

    get pruningEnabled() {
        return Boolean(
            validator.isString(this.raw)
                ? this.graph.options.pruning.type_pruning
                : this.raw.pruning ?? this.graph.options.pruning.type_pruning
        )
    }

    get defaultCondition() {
        return this.container.presenceCondition
    }

    private _presenceCondition?: LogicExpression

    get presenceCondition(): LogicExpression {
        if (validator.isUndefined(this._presenceCondition))
            this._presenceCondition = this.container.getTypeCondition(this)

        if (validator.isUndefined(this._presenceCondition)) throw new Error(`${this.Display} has no presence condition`)

        return this._presenceCondition
    }

    // Check if no other type is present
    private _defaultAlternativeCondition?: LogicExpression
    get defaultAlternativeCondition(): LogicExpression {
        if (validator.isUndefined(this._defaultAlternativeCondition))
            this._defaultAlternativeCondition = bratanize(this.container.types.filter(it => it !== this))
        return this._defaultAlternativeCondition
    }

    isType() {
        return true
    }
}
