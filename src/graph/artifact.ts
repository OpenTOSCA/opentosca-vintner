import * as check from '#check'
import Element from '#graph/element'
import Node from '#graph/node'
import Property from '#graph/property'
import Type from '#graph/type'
import {andify, bratify} from '#graph/utils'
import {ExtendedArtifactDefinition} from '#spec/artifact-definitions'
import {ArtifactDefaultConditionMode, ConditionsWrapper, LogicExpression} from '#spec/variability'
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

    get getDefaultMode(): ArtifactDefaultConditionMode {
        return this.raw.default_condition_mode ?? this.graph.options.default.artifactDefaultConditionMode
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

    getType() {
        if (this.types.length > 1) throw new Error(`${this.Display} has more than one type`)
        return this.types[0]
    }

    getTypeSpecificConditionWrapper() {
        return this.graph.getTypeSpecificConditions()?.artifact_types?.[this.raw.type]
    }

    getElementGenericCondition() {
        const consistencies: LogicExpression[] = []
        const semantics: LogicExpression[] = []

        const mode = this.getDefaultMode
        mode.split('-').forEach(it => {
            if (!['container', 'managed'].includes(it))
                throw new Error(`${this.Display} has unknown mode "${mode}" as default condition`)

            if (it === 'container') {
                return consistencies.push(this.container.presenceCondition)
            }

            /**
             * Artifact should be present if any respective technology is present
             *
             * Note, if no respective technology exists, then "or" is an empty list, which evaluates to "false".
             * As a result, the artifact is always removed, as intended.
             */
            if (it === 'managed') {
                return semantics.push({is_managed: 'SELF', _cached_element: this})
            }
        })

        const wrappers: ConditionsWrapper[] = []

        if (!utils.isEmpty(consistencies)) {
            wrappers.push({conditions: andify(consistencies), consistency: true, semantic: false})
        }

        if (!utils.isEmpty(semantics)) {
            wrappers.push({conditions: andify(semantics), consistency: false, semantic: true})
        }

        return wrappers
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

    isEDMM() {
        return true
    }
}
