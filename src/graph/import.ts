import {ExtendedImportDefinition} from '#spec/import-definition'
import * as utils from '#utils'
import Element from './element'

export default class Import extends Element {
    readonly type = 'import'
    readonly name: string
    readonly raw: ExtendedImportDefinition
    readonly index: number

    constructor(data: {index: number; raw: ExtendedImportDefinition}) {
        super()

        this.index = data.index
        this.name = data.index.toString()
        this.raw = data.raw
        this.conditions = utils.toList(data.raw.conditions)
    }

    get toscaId() {
        return this.index
    }

    constructPresenceCondition() {
        return {import_presence: this.toscaId, _cached_element: this}
    }

    isImport(): this is Import {
        return true
    }
}
