import {andify} from '#graph/utils'
import {OutputDefinition} from '#spec/topology-template'
import {ConditionsWrapper, LogicExpression, OutputDefaultConditionMode} from '#spec/variability'
import * as utils from '#utils'
import Element from './element'

export default class Output extends Element {
    readonly type = 'output'
    readonly name: string
    readonly raw: OutputDefinition
    readonly index: number

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

    get getDefaultMode(): OutputDefaultConditionMode {
        return this.raw.default_condition_mode ?? this.graph.options.default.outputDefaultConditionMode
    }

    getElementGenericCondition() {
        const consistencies: LogicExpression[] = []
        const semantics: LogicExpression[] = []

        const mode = this.getDefaultMode
        mode.split('-').forEach(it => {
            if (!['produced', 'default'].includes(it))
                throw new Error(`${this.Display} has unknown mode "${mode}" as default condition`)

            if (it === 'produced') {
                return semantics.push({is_produced: this.toscaId, _cached_element: this})
            }

            if (it === 'default' && this.defaultAlternativePruningConditionAllowed) {
                return consistencies.push(this.constructDefaultAlternativeCondition())
            }
        })

        const wrappers: ConditionsWrapper[] = []

        if (utils.isPopulated(consistencies)) {
            wrappers.push({conditions: andify(consistencies), consistency: true, semantic: false})
        }

        if (utils.isPopulated(semantics)) {
            wrappers.push({conditions: andify(semantics), consistency: false, semantic: true})
        }

        return wrappers
    }

    constructPresenceCondition() {
        return {output_presence: this.toscaId, _cached_element: this}
    }

    // Check if no other output having the same name is present
    get defaultAlternativeScope() {
        return this.graph.outputsMap.get(this.name)!
    }

    isOutput(): this is Output {
        return true
    }

    isEDMM() {
        return true
    }
}
