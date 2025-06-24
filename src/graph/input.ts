import Property from '#graph/property'
import {bratify} from '#graph/utils'
import {InputDefinition} from '#spec/topology-template'
import {LogicExpression} from '#spec/variability'
import * as utils from '#utils'
import Element from './element'

export default class Input extends Element {
    readonly type = 'input'
    readonly name: string
    readonly raw: InputDefinition
    readonly index: number

    readonly consumers: Property[] = []

    constructor(data: {name: string; raw: InputDefinition; index: number}) {
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
        return this.raw.default_condition ?? this.graph.options.default.inputDefaultCondition
    }

    get pruningEnabled() {
        return this.raw.pruning ?? this.graph.options.pruning.inputPruning
    }

    get defaultConsistencyCondition() {
        return (
            this.raw.default_consistency_condition ??
            this.raw.default_condition ??
            this.graph.options.default.inputDefaultConsistencyCondition
        )
    }

    get defaultSemanticCondition() {
        return (
            this.raw.default_semantic_condition ??
            this.raw.default_condition ??
            this.graph.options.default.inputDefaultSemanticCondition
        )
    }

    get consistencyPruning() {
        return this.raw.consistency_pruning ?? this.raw.pruning ?? this.graph.options.pruning.inputConsistencyPruning
    }

    get semanticPruning() {
        return this.raw.semantic_pruning ?? this.raw.pruning ?? this.graph.options.pruning.inputSemanticPruning
    }

    getElementGenericCondition() {
        return [
            {
                conditions: {is_consumed: this.toscaId, _cached_element: this},
                consistency: false,
                semantic: true,
            },
        ]
    }

    constructPresenceCondition() {
        return {input_presence: this.toscaId, _cached_element: this}
    }

    // Check if no other input having the same name is present
    constructDefaultAlternativeCondition(): LogicExpression {
        return bratify(this.graph.inputsMap.get(this.name)!.filter(it => it !== this))
    }

    isInput(): this is Input {
        return true
    }

    isEDMM() {
        return true
    }
}
