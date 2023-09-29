import {InputDefinition} from '#spec/topology-template'
import * as utils from '#utils'
import Element from './element'

export default class Input extends Element {
    readonly type = 'input'
    readonly name: string
    readonly raw: InputDefinition

    constructor(data: {name: string; raw: InputDefinition}) {
        super()

        this.name = data.name
        this.raw = data.raw
        this.conditions = utils.toList(data.raw.conditions)
    }

    get toscaId() {
        return this.name
    }

    constructPresenceCondition() {
        return {input_presence: this.toscaId, _cached_element: this}
    }

    isInput() {
        return true
    }
}
