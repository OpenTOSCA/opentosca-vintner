import * as assert from '#assert'
import * as check from '#check'
import Element from '#graph/element'
import Node from '#graph/node'
import {andify} from '#graph/utils'
import {TechnologyTemplate} from '#spec/technology-template'
import {
    ConditionsWrapper,
    LogicExpression,
    TechnologyDefaultConditionMode,
    TechnologyPresenceArguments,
} from '#spec/variability'
import {Scenario} from '#technologies/types'
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
    readonly scenario?: Scenario

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

        this.scenario = data.raw.scenario
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
        const consistencies: LogicExpression[] = []
        const semantics: LogicExpression[] = []

        const mode = this.getDefaultMode
        mode.split('-').forEach(it => {
            if (!['container', 'other', 'scenario'].includes(it))
                throw new Error(`${this.Display} has unknown mode "${mode}" as default condition`)

            if (it === 'container') {
                return consistencies.push(this.container.presenceCondition)
            }

            if (it === 'scenario') {
                if (check.isDefined(this.scenario)) {
                    const matches = this.graph.technologyRulePlugin.match(this.container, this.scenario)
                    return semantics.push({
                        or: matches.map(jt => ({and: jt.elements.map(kt => kt.presenceCondition)})),
                    })
                }
            }

            if (it === 'other') {
                // TODO: Cant use this.defaultAlternativeCondition since it checks for this.alternative ...
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

    get defaultAlternativeScope() {
        return this.container.technologies
    }

    constructPresenceCondition(): LogicExpression {
        return {technology_presence: this.toscaId, _cached_element: this}
    }

    isTechnology(): this is Technology {
        return true
    }

    isEDMM() {
        return true
    }
}
