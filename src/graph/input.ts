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

    constructor(data: {name: string; raw: InputDefinition; index: number}) {
        super()

        this.name = data.name
        this.raw = data.raw
        this.index = data.index
        this.conditions = utils.toList(data.raw.conditions)
        this.defaultAlternative = data.raw.default_alternative ?? false
    }

    get toscaId() {
        return this.name
    }

    constructPresenceCondition() {
        return {input_presence: this.toscaId, _cached_element: this}
    }

    // Check if no other input having the same name is present
    constructDefaultAlternativeCondition(): LogicExpression {
        return bratify(this.graph.inputsMap.get(this.name)!.filter(it => it !== this))
    }

    isInput() {
        return true
    }
}
