import {ConditionalPropertyAssignmentValue, PropertyAssignmentValue} from '#spec/property-assignments'
import {LogicExpression, ValueExpression} from '#spec/variability'
import * as validator from '#validator'
import Node from './node'
import Relation from './relation'
import Policy from './policy'
import Group from './group'
import Artifact from './artifact'
import Element from './element'
import {bratanize} from '#graph/utils'
import {NodeTemplate} from '#spec/node-template'
import {RelationshipTemplate} from '#spec/relationship-template'
import {PolicyTemplate} from '#spec/policy-template'
import {GroupTemplate} from '#spec/group-template'
import {ArtifactDefinition} from '#spec/artifact-definitions'

export type PropertyContainer = Node | Relation | Policy | Group | Artifact
export type PropertyContainerTemplate =
    | NodeTemplate
    | RelationshipTemplate
    | PolicyTemplate
    | GroupTemplate
    | ArtifactDefinition

export default class Property extends Element {
    readonly name: string
    readonly type = 'property'
    readonly raw: ConditionalPropertyAssignmentValue | PropertyAssignmentValue
    readonly index?: number
    readonly container: PropertyContainer

    value?: PropertyAssignmentValue
    readonly expression?: ValueExpression

    constructor(data: {
        name: string
        raw: ConditionalPropertyAssignmentValue | PropertyAssignmentValue
        container: PropertyContainer
        index?: number
        value?: PropertyAssignmentValue
        expression?: ValueExpression
        default: boolean
        conditions?: LogicExpression[]
    }) {
        super()

        this.name = data.name
        this.raw = data.raw
        this.index = data.index
        this.container = data.container

        this.value = data.value
        this.expression = data.expression
        this.defaultAlternative = data.default
        this.conditions = data.conditions || []
    }

    get toscaId(): [string, string | number] {
        if (validator.isDefined(this.index)) return [this.container.name, this.index]
        return [this.container.name, this.name]
    }

    get defaultEnabled() {
        return Boolean(
            !validator.isObject(this.raw) || validator.isArray(this.raw)
                ? this.graph.options.default.property_default_condition
                : this.raw.default_condition ?? this.graph.options.default.property_default_condition
        )
    }

    get pruningEnabled() {
        return Boolean(
            !validator.isObject(this.raw) || validator.isArray(this.raw)
                ? this.graph.options.pruning.property_pruning
                : this.raw.pruning ?? this.graph.options.pruning.property_pruning
        )
    }

    get defaultCondition() {
        return this.container.presenceCondition
    }

    private _presenceCondition?: LogicExpression
    get presenceCondition(): LogicExpression {
        if (validator.isUndefined(this._presenceCondition))
            this._presenceCondition = this.container.getPropertyCondition(this)
        return this._presenceCondition
    }

    // Check if no other property having the same name is present
    private _defaultAlternativeCondition?: LogicExpression
    get defaultAlternativeCondition(): LogicExpression {
        if (validator.isUndefined(this._defaultAlternativeCondition))
            this._defaultAlternativeCondition = bratanize(
                this.container.propertiesMap.get(this.name)!.filter(it => it !== this)
            )
        return this._defaultAlternativeCondition
    }

    isProperty() {
        return true
    }
}
