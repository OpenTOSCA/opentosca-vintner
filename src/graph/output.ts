import {bratify} from '#graph/utils'
import {OutputDefinition} from '#spec/topology-template'
import {LogicExpression} from '#spec/variability'
import * as utils from '#utils'
import Element from './element'

export default class Output extends Element {
    readonly type = 'output'
    readonly name: string
    readonly raw: OutputDefinition
    readonly index: number

    // TODO: fill this
    readonly producers: Element[] = []

    constructor(data: {name: string; raw: OutputDefinition; index: number}) {
        super()

        this.name = data.name
        this.raw = data.raw
        this.index = data.index
        this.conditions = utils.toList(data.raw.conditions)
        this.defaultAlternative = data.raw.default_alternative ?? false
    }

    get toscaId() {
        return this.index
    }

    get defaultEnabled() {
        return this.raw.default_condition ?? this.graph.options.default.outputDefaultCondition
    }

    get pruningEnabled() {
        return this.raw.pruning ?? this.graph.options.pruning.outputPruning
    }

    get defaultConsistencyCondition() {
        return (
            this.raw.default_consistency_condition ??
            this.raw.default_condition ??
            this.graph.options.default.outputDefaultConsistencyCondition
        )
    }

    get defaultSemanticCondition() {
        return (
            this.raw.default_semantic_condition ??
            this.raw.default_condition ??
            this.graph.options.default.outputDefaultSemanticCondition
        )
    }

    get consistencyPruning() {
        return this.raw.consistency_pruning ?? this.raw.pruning ?? this.graph.options.pruning.outputConsistencyPruning
    }

    get semanticPruning() {
        return this.raw.semantic_pruning ?? this.raw.pruning ?? this.graph.options.pruning.outputSemanticPruning
    }

    getElementGenericCondition() {
        // {and: this.producers.map(it => it.presenceCondition)}
        return {
            conditions: {is_produced: this.toscaId, _cached_element: this},
            consistency: false,
            semantic: true,
        }
    }

    constructPresenceCondition() {
        return {output_presence: this.toscaId, _cached_element: this}
    }

    // Check if no other output having the same name is present
    constructDefaultAlternativeCondition(): LogicExpression {
        return bratify(this.graph.outputsMap.get(this.name)!.filter(it => it !== this))
    }

    isOutput() {
        return true
    }
}
