import * as check from '#check'
import {bratanize} from '#graph/utils'
import {ArtifactDefinition} from '#spec/artifact-definitions'
import {GroupTemplate} from '#spec/group-template'
import {NodeTemplate} from '#spec/node-template'
import {PolicyTemplate} from '#spec/policy-template'
import {ConditionalPropertyAssignmentValue, PropertyAssignmentValue} from '#spec/property-assignments'
import {RelationshipTemplate} from '#spec/relationship-template'
import {LogicExpression, ValueExpression} from '#spec/variability'
import Artifact from './artifact'
import Element from './element'
import Group from './group'
import Node from './node'
import Policy from './policy'
import Relation from './relation'

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
        if (check.isDefined(this.index)) return [this.container.name, this.index]
        return [this.container.name, this.name]
    }

    get defaultEnabled() {
        if (!check.isObject(this.raw) || check.isArray(this.raw))
            return this.graph.options.default.propertyDefaultCondition
        // TODO: fix this
        return Boolean(this.raw.default_condition ?? this.graph.options.default.propertyDefaultCondition)
    }

    get pruningEnabled() {
        if (!check.isObject(this.raw) || check.isArray(this.raw)) return this.graph.options.pruning.propertyPruning
        // TODO: fix this
        return Boolean(this.raw.pruning ?? this.graph.options.pruning.propertyPruning)
    }

    get defaultConsistencyCondition() {
        return this.graph.options.default.propertyDefaultConsistencyCondition
    }

    get defaultSemanticCondition() {
        return this.graph.options.default.propertyDefaultSemanticCondition
    }

    get consistencyPruning() {
        return this.graph.options.pruning.propertyConsistencyPruning
    }

    get semanticPruning() {
        return this.graph.options.pruning.propertySemanticPruning
    }

    // TODO: get type from type definition being part of the container type ...
    private _defaultCondition?: LogicExpression
    get defaultCondition() {
        return this.container.presenceCondition
    }

    private _presenceCondition?: LogicExpression
    get presenceCondition(): LogicExpression {
        if (check.isUndefined(this._presenceCondition))
            this._presenceCondition = this.container.getPropertyCondition(this)
        return this._presenceCondition
    }

    // Check if no other property having the same name is present
    private _defaultAlternativeCondition?: LogicExpression
    get defaultAlternativeCondition(): LogicExpression {
        if (check.isUndefined(this._defaultAlternativeCondition))
            this._defaultAlternativeCondition = bratanize(
                this.container.propertiesMap.get(this.name)!.filter(it => it !== this)
            )
        return this._defaultAlternativeCondition
    }

    isProperty() {
        return true
    }
}
