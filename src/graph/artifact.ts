import Element from '#graph/element'
import Node from '#graph/node'
import Property from '#graph/property'
import {bratanize} from '#graph/utils'
import {ArtifactDefinition} from '#spec/artifact-definitions'
import {LogicExpression} from '#spec/variability'
import * as utils from '#utils'
import * as validator from '#validator'

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
        this.conditions = validator.isString(data.raw)
            ? []
            : validator.isDefined(data.raw.default_alternative)
            ? [false]
            : utils.toList(data.raw.conditions)
        this.defaultAlternative = (validator.isString(data.raw) ? false : data.raw.default_alternative) || false
    }

    get toscaId(): [string, string | number] {
        if (validator.isDefined(this.index)) return [this.container.name, this.index]
        return [this.container.name, this.name]
    }

    get defaultEnabled() {
        return Boolean(
            validator.isString(this.raw)
                ? this.graph.options.default.artifact_default_condition
                : this.raw.default_condition ?? this.graph.options.default.artifact_default_condition
        )
    }

    get pruningEnabled() {
        return Boolean(
            validator.isString(this.raw)
                ? this.graph.options.pruning.artifact_pruning
                : this.raw.pruning ?? this.graph.options.pruning.artifact_pruning
        )
    }

    get defaultCondition() {
        return this.container.presenceCondition
    }

    private _presenceCondition?: LogicExpression
    get presenceCondition(): LogicExpression {
        if (validator.isUndefined(this._presenceCondition))
            this._presenceCondition = {artifact_presence: this.toscaId, _cached_element: this}
        return this._presenceCondition
    }

    // Check if no other artifact having the same name is present
    private _defaultAlternativeCondition?: LogicExpression
    get defaultAlternativeCondition(): LogicExpression {
        if (validator.isUndefined(this._defaultAlternativeCondition))
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
