import * as assert from '#assert'
import * as check from '#check'
import Element from '#graph/element'
import Node from '#graph/node'
import Property from '#graph/property'
import {bratanize} from '#graph/utils'
import {ArtifactDefinition} from '#spec/artifact-definitions'
import {LogicExpression} from '#spec/variability'
import * as utils from '#utils'

export default class Artifact extends Element {
    readonly type = 'artifact'
    readonly name: string
    readonly raw: ArtifactDefinition
    readonly index?: number
    readonly container: Node

    readonly properties: Property[] = []
    readonly propertiesMap: Map<String, Property[]> = new Map()

    constructor(data: {name: string; raw: ArtifactDefinition; container: Node; index?: number}) {
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
        this.defaultAlternative = (check.isString(data.raw) ? false : data.raw.default_alternative) || false
    }

    get toscaId(): [string, string | number] {
        if (check.isDefined(this.index)) return [this.container.name, this.index]
        return [this.container.name, this.name]
    }

    get defaultEnabled() {
        if (check.isString(this.raw)) return this.graph.options.default.artifactDefaultCondition
        return this.raw.default_condition ?? this.graph.options.default.artifactDefaultCondition
    }

    get pruningEnabled() {
        if (check.isString(this.raw)) return this.graph.options.pruning.artifactPruning
        return this.raw.pruning ?? this.graph.options.pruning.artifactPruning
    }

    get defaultConsistencyCondition() {
        if (check.isString(this.raw)) return this.graph.options.default.artifactDefaultConsistencyCondition
        return this.raw.default_condition ?? this.graph.options.default.artifactDefaultConsistencyCondition
    }

    get defaultSemanticCondition() {
        if (check.isString(this.raw)) return this.graph.options.default.artifactDefaultSemanticCondition
        return this.raw.default_condition ?? this.graph.options.default.artifactDefaultSemanticCondition
    }

    get consistencyPruning() {
        if (check.isString(this.raw)) return this.graph.options.pruning.artifactConsistencyPruning
        return this.raw.pruning ?? this.graph.options.pruning.artifactConsistencyPruning
    }

    get semanticPruning() {
        if (check.isString(this.raw)) return this.graph.options.pruning.artifactSemanticPruning
        return this.raw.pruning ?? this.graph.options.pruning.artifactSemanticPruning
    }

    get defaultCondition() {
        return this.container.presenceCondition
    }

    getTypeSpecificCondition() {
        const type = check.isString(this.raw) ? 'tosca.artifacts.File' : this.raw.type ?? 'tosca.artifacts.File'
        assert.isString(type)

        const tsc =
            this.graph.serviceTemplate.topology_template?.variability?.type_specific_conditions?.artifact_types?.[type]
        if (check.isUndefined(tsc)) return
        assert.isDefined(tsc.conditions, `${this.Display} holds type-specific condition without any condition`)

        tsc.consistency = tsc.consistency ?? false
        tsc.consistency = tsc.semantic ?? true

        return utils.copy(tsc)
    }

    getElementSpecificCondition() {
        return {conditions: this.container.presenceCondition, consistency: true, semantic: false}
    }

    private _presenceCondition?: LogicExpression
    get presenceCondition(): LogicExpression {
        if (check.isUndefined(this._presenceCondition))
            this._presenceCondition = {artifact_presence: this.toscaId, _cached_element: this}
        return this._presenceCondition
    }

    // Check if no other artifact having the same name is present
    private _defaultAlternativeCondition?: LogicExpression
    get defaultAlternativeCondition(): LogicExpression {
        if (check.isUndefined(this._defaultAlternativeCondition))
            this._defaultAlternativeCondition = bratanize(
                this.container.artifactsMap.get(this.name)!.filter(it => it !== this)
            )
        return this._defaultAlternativeCondition
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
