import * as check from '#check'
import {ImportDefinition} from '#spec/import-definition'
import {LogicExpression} from '#spec/variability'
import * as utils from '#utils'
import Element from './element'

export default class Import extends Element {
    readonly type = 'import'
    readonly name: string
    readonly raw: ImportDefinition
    readonly index: number

    constructor(data: {index: number; raw: ImportDefinition}) {
        super()

        this.index = data.index
        this.name = data.index.toString()
        this.raw = data.raw

        if (!check.isString(data.raw)) this.conditions = utils.toList(data.raw.conditions)
    }

    get toscaId() {
        return this.index
    }

    readonly defaultEnabled = false
    readonly pruningEnabled = false

    readonly defaultConsistencyCondition = true
    readonly defaultSemanticCondition = true
    readonly consistencyPruning = true
    readonly semanticPruning = true

    private _presenceCondition?: LogicExpression
    get presenceCondition(): LogicExpression {
        if (check.isUndefined(this._presenceCondition))
            this._presenceCondition = {import_presence: this.toscaId, _cached_element: this}
        return this._presenceCondition
    }

    readonly defaultAlternativeCondition: undefined

    isImport() {
        return true
    }
}
