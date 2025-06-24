import * as check from '#check'
import Input from '#graph/input'
import {andify} from '#graph/utils'
import {ArtifactDefinition} from '#spec/artifact-definitions'
import {GroupTemplate} from '#spec/group-template'
import {NodeTemplate} from '#spec/node-template'
import {PolicyTemplate} from '#spec/policy-template'
import {ConditionalPropertyAssignmentValue, PropertyAssignmentValue} from '#spec/property-assignments'
import {RelationshipTemplate} from '#spec/relationship-template'
import {LogicExpression, PropertyDefaultConditionMode, ValueExpression} from '#spec/variability'
import * as utils from '#utils'
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
    readonly raw: ConditionalPropertyAssignmentValue
    readonly index: number
    readonly container: PropertyContainer

    value?: PropertyAssignmentValue
    readonly expression?: ValueExpression

    readonly consuming: (Property | Input | Node | Relation | Group | Policy | Artifact)[] = []

    constructor(data: {
        name: string
        raw: ConditionalPropertyAssignmentValue
        container: PropertyContainer
        index: number
    }) {
        super()

        this.name = data.name
        this.raw = data.raw
        this.index = data.index
        this.container = data.container

        this.value = data.raw.value
        this.expression = data.raw.expression
        this.conditions = check.isDefined(data.raw.default_alternative) ? [false] : utils.toList(data.raw.conditions)
        this.defaultAlternative = data.raw.default_alternative ?? false
    }

    get toscaId(): [string, string | number] {
        return [this.container.name, this.index]
    }

    get defaultEnabled() {
        return this.raw.default_condition ?? this.graph.options.default.propertyDefaultCondition
    }

    get pruningEnabled() {
        return this.raw.pruning ?? this.graph.options.pruning.propertyPruning
    }

    get defaultConsistencyCondition() {
        return (
            this.raw.default_consistency_condition ??
            this.raw.default_condition ??
            this.graph.options.default.propertyDefaultConsistencyCondition
        )
    }

    get defaultSemanticCondition() {
        return (
            this.raw.default_semantic_condition ??
            this.raw.default_condition ??
            this.graph.options.default.propertyDefaultSemanticCondition
        )
    }

    get consistencyPruning() {
        return this.raw.consistency_pruning ?? this.raw.pruning ?? this.graph.options.pruning.propertyConsistencyPruning
    }

    get semanticPruning() {
        return this.raw.semantic_pruning ?? this.raw.pruning ?? this.graph.options.pruning.propertySemanticPruning
    }

    // TODO: getTypeSpecificCondition, however, get type from type definition being part of the container type ...

    get getDefaultMode(): PropertyDefaultConditionMode {
        return this.raw.default_condition_mode ?? this.graph.options.default.propertyDefaultConditionMode
    }

    getElementGenericCondition() {
        const conditions: LogicExpression[] = []

        const mode = this.getDefaultMode
        mode.split('-').forEach(it => {
            if (!['container', 'consuming'].includes(it))
                throw new Error(`${this.Display} has unknown mode "${mode}" as default condition`)

            if (it === 'container') {
                return conditions.push(this.container.presenceCondition)
            }

            if (it === 'consuming') {
                if (utils.isEmpty(this.consuming)) return
                return conditions.push({or: this.consuming.map(consumed => consumed.presenceCondition)})
            }
        })

        return [{conditions: andify(conditions), consistency: true, semantic: false}]
    }

    constructPresenceCondition() {
        return this.container.getPropertyCondition(this)
    }

    get defaultAlternativeScope() {
        return this.container.propertiesMap.get(this.name)!
    }

    /**
     * A property is implied by default.
     * This is also okay for default alternatives since bratan condition is a manual condition.
     */
    get implied() {
        return this.raw.implied ?? true
    }

    isProperty(): this is Property {
        return true
    }

    isEDMM() {
        return true
    }
}
