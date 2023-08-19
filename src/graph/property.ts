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

    // TODO: fix these ugly "if (!check.isObject(this.raw) || check.isArray(this.raw))" and "Boolean" castings ...

    get defaultEnabled() {
        if (!check.isObject(this.raw) || check.isArray(this.raw))
            return this.graph.options.default.propertyDefaultCondition
        return Boolean(this.raw.default_condition ?? this.graph.options.default.propertyDefaultCondition)
    }

    get pruningEnabled() {
        if (!check.isObject(this.raw) || check.isArray(this.raw)) return this.graph.options.pruning.propertyPruning
        return Boolean(this.raw.pruning ?? this.graph.options.pruning.propertyPruning)
    }

    get defaultConsistencyCondition() {
        if (!check.isObject(this.raw) || check.isArray(this.raw))
            return this.graph.options.default.propertyDefaultConsistencyCondition
        return Boolean(this.raw.default_condition ?? this.graph.options.default.propertyDefaultConsistencyCondition)
    }

    get defaultSemanticCondition() {
        if (!check.isObject(this.raw) || check.isArray(this.raw))
            return this.graph.options.default.propertyDefaultSemanticCondition
        return Boolean(this.raw.default_condition ?? this.graph.options.default.propertyDefaultSemanticCondition)
    }

    get consistencyPruning() {
        if (!check.isObject(this.raw) || check.isArray(this.raw))
            return this.graph.options.pruning.propertyConsistencyPruning
        return Boolean(this.raw.pruning ?? this.graph.options.pruning.propertyConsistencyPruning)
    }

    get semanticPruning() {
        if (!check.isObject(this.raw) || check.isArray(this.raw))
            return this.graph.options.pruning.propertySemanticPruning
        return Boolean(this.raw.pruning ?? this.graph.options.pruning.propertySemanticPruning)
    }

    // TODO: getTypeSpecificCondition, however, get type from type definition being part of the container type ...

    getElementGenericCondition() {
        return {conditions: this.container.presenceCondition, consistency: true, semantic: false}
    }

    constructPresenceCondition() {
        return this.container.getPropertyCondition(this)
    }

    // Check if no other property having the same name is present
    constructDefaultAlternativeCondition() {
        return bratanize(this.container.propertiesMap.get(this.name)!.filter(it => it !== this))
    }

    isProperty() {
        return true
    }
}
