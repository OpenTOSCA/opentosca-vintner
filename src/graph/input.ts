import {InputDefinition} from '#spec/topology-template'
import {LogicExpression} from '#spec/variability'
import * as utils from '#utils'
import * as validator from '#validator'
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

    readonly defaultEnabled = false
    readonly pruningEnabled = false
    readonly defaultCondition = true

    private _presenceCondition?: LogicExpression
    get presenceCondition(): LogicExpression {
        if (validator.isUndefined(this._presenceCondition))
            this._presenceCondition = {input_presence: this.toscaId, _cached_element: this}
        return this._presenceCondition
    }

    readonly defaultAlternativeCondition: undefined

    isInput() {
        return true
    }
}
