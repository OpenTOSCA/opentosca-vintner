import * as check from '#check'
import Element from '#graph/element'
import Node from '#graph/node'
import {bratify} from '#graph/utils'
import {TechnologyTemplate} from '#spec/node-template'
import {LogicExpression, TechnologyPresenceArguments} from '#spec/variability'
import * as utils from '#utils'

export default class Technology extends Element {
    readonly name: string
    readonly type = 'technology'
    readonly raw: TechnologyTemplate
    readonly index: number
    readonly container: Node

    readonly defaultAlternative: boolean

    constructor(data: {name: string; raw: TechnologyTemplate; container: Node; index: number}) {
        super()

        this.name = data.name
        this.raw = data.raw
        this.container = data.container
        this.index = data.index

        this.conditions = check.isDefined(data.raw.default_alternative) ? [false] : utils.toList(data.raw.conditions)

        // TODO: this overrides conditions -> move it to pruning
        this.defaultAlternative = check.isObject(data.raw.default_alternative) ?? true
    }

    get toscaId(): TechnologyPresenceArguments {
        return [this.container.name, this.index]
    }

    get defaultEnabled() {
        return this.raw.default_condition ?? this.graph.options.default.technologyDefaultCondition
    }

    get pruningEnabled() {
        return this.raw.pruning ?? this.graph.options.pruning.technologyPruning
    }

    get defaultConsistencyCondition() {
        return (
            this.raw.default_consistency_condition ??
            this.raw.default_condition ??
            this.graph.options.default.technologyDefaultConsistencyCondition
        )
    }

    get defaultSemanticCondition() {
        return (
            this.raw.default_semantic_condition ??
            this.raw.default_condition ??
            this.graph.options.default.technologyDefaultSemanticCondition
        )
    }

    get consistencyPruning() {
        return (
            this.raw.consistency_pruning ?? this.raw.pruning ?? this.graph.options.pruning.technologyConsistencyPruning
        )
    }

    get semanticPruning() {
        return this.raw.semantic_pruning ?? this.raw.pruning ?? this.graph.options.pruning.technologySemanticPruning
    }

    getElementGenericCondition() {
        return {conditions: this.container.presenceCondition, consistency: true, semantic: false}
    }

    constructDefaultAlternativeCondition(): LogicExpression {
        return bratify(this.container.technologies.filter(it => it !== this))
    }

    constructPresenceCondition(): LogicExpression {
        return {technology_presence: this.toscaId, _cached_element: this}
    }

    // TODO: the whole pruning stuff

    isTechnology() {
        return true
    }
}
