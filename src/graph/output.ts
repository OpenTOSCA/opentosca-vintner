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
