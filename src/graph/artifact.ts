import * as check from '#check'
import Element from '#graph/element'
import Node from '#graph/node'
import Property from '#graph/property'
import Type from '#graph/type'
import {bratify} from '#graph/utils'
import {ExtendedArtifactDefinition} from '#spec/artifact-definitions'
import {LogicExpression} from '#spec/variability'
import * as utils from '#utils'

export default class Artifact extends Element {
    readonly type = 'artifact'
    readonly name: string
    readonly raw: ExtendedArtifactDefinition
    readonly index: number
    readonly container: Node

    readonly properties: Property[] = []
    readonly propertiesMap: Map<String, Property[]> = new Map()

    readonly types: Type[] = []
    readonly typesMap: Map<String, Type[]> = new Map()

    constructor(data: {name: string; raw: ExtendedArtifactDefinition; container: Node; index: number}) {
        super()

        this.name = data.name
        this.raw = data.raw
        this.index = data.index
        this.container = data.container
        this.conditions = check.isDefined(data.raw.default_alternative) ? [false] : utils.toList(data.raw.conditions)
        this.defaultAlternative = data.raw.default_alternative ?? false
    }

    get toscaId(): [string, string | number] {
        return [this.container.name, this.index]
    }

    get defaultEnabled() {
        return this.raw.default_condition ?? this.graph.options.default.artifactDefaultCondition
    }

    get pruningEnabled() {
        return this.raw.pruning ?? this.graph.options.pruning.artifactPruning
    }

    get defaultConsistencyCondition() {
        return (
            this.raw.default_consistency_condition ??
            this.raw.default_condition ??
            this.graph.options.default.artifactDefaultConsistencyCondition
        )
    }

    get defaultSemanticCondition() {
        return (
            this.raw.default_semantic_condition ??
            this.raw.default_condition ??
            this.graph.options.default.artifactDefaultSemanticCondition
        )
    }

    get consistencyPruning() {
        return this.raw.consistency_pruning ?? this.raw.pruning ?? this.graph.options.pruning.artifactConsistencyPruning
    }

    get semanticPruning() {
        return this.raw.semantic_pruning ?? this.raw.pruning ?? this.graph.options.pruning.artifactSemanticPruning
    }

    getTypeSpecificConditionWrapper() {
        return this.graph.getTypeSpecificConditions()?.artifact_types?.[this.raw.type]
    }

    getElementGenericCondition() {
        return {conditions: this.container.presenceCondition, consistency: true, semantic: false}
    }

    constructPresenceCondition() {
        return {artifact_presence: this.toscaId, _cached_element: this}
    }

    // Check if no other artifact having the same name is present
    constructDefaultAlternativeCondition(): LogicExpression {
        return bratify(this.container.artifactsMap.get(this.name)!.filter(it => it !== this))
    }

    getTypeCondition(type: Type): LogicExpression {
        return {artifact_type_presence: [...this.toscaId, type.index], _cached_element: type}
    }

    getPropertyCondition(property: Property): LogicExpression {
        return {
            artifact_property_presence: [...this.toscaId, property.index ?? property.name],
            _cached_element: property,
        }
    }

    isArtifact() {
        return true
    }
}
