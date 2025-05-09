import * as assert from '#assert'
import * as check from '#check'
import Element from '#graph/element'
import Node from '#graph/node'
import {andify, bratify} from '#graph/utils'
import {TechnologyTemplate} from '#spec/technology-template'
import {LogicExpression, TechnologyDefaultConditionMode, TechnologyPresenceArguments} from '#spec/variability'
import * as utils from '#utils'

export const TECHNOLOGY_DEFAULT_WEIGHT = 1

export default class Technology extends Element {
    readonly name: string
    readonly type = 'technology'
    readonly raw: TechnologyTemplate
    readonly index: number
    readonly container: Node
    readonly weight: number
    readonly assign: string
    readonly prio: number

    readonly defaultAlternative: boolean

    constructor(data: {name: string; raw: TechnologyTemplate; container: Node; index: number}) {
        super()

        this.name = data.name
        this.raw = data.raw
        this.container = data.container
        this.index = data.index

        assert.isDefined(data.raw.assign, `${this.Display} not normalized`)
        this.assign = data.raw.assign

        this.conditions = check.isDefined(data.raw.default_alternative) ? [false] : utils.toList(data.raw.conditions)
        this.defaultAlternative = data.raw.default_alternative ?? false

        this.weight = data.raw.weight ?? TECHNOLOGY_DEFAULT_WEIGHT
        assert.isNumber(this.weight)
        if (this.weight < 0) throw new Error(`Weight "${data.raw.weight}" of ${this.display} is a negative number`)
        if (this.weight > 1) throw new Error(`Weight "${data.raw.weight}" of ${this.display} is larger than 1`)

        this.prio = data.raw.prio ?? 0
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

    get getDefaultMode(): TechnologyDefaultConditionMode {
        return this.raw.default_condition_mode ?? this.graph.options.default.technologyDefaultConditionMode
    }
    getElementGenericCondition() {
        const conditions: LogicExpression[] = []

        const mode = this.getDefaultMode
        mode.split('-').forEach(it => {
            if (!['container', 'other'].includes(it))
                throw new Error(`${this.Display} has unknown mode "${mode}" as default condition`)

            if (it === 'container') {
                return conditions.push(this.container.presenceCondition)
            }
            if (it === 'other') {
                // TODO: Cant use this.defaultAlternativeCondition since it checks for this.alternative ...
                return conditions.push(this.constructDefaultAlternativeCondition())
            }
        })

        return [
            {
                conditions: andify(conditions),
                consistency: true,
                semantic: false,
            },
        ]
    }

    // Check if no other technology is present
    constructDefaultAlternativeCondition(): LogicExpression {
        return bratify(this.container.technologies.filter(it => it !== this))
    }

    constructPresenceCondition(): LogicExpression {
        return {technology_presence: this.toscaId, _cached_element: this}
    }

    isTechnology() {
        return true
    }

    isEDMM() {
        return true
    }
}
