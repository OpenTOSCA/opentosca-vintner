import * as assert from '#assert'
import * as check from '#check'
import {Entry} from '#repository/store'

export type StoreImportOptions = {name?: string; file?: string; content?: string}

export default async function (options: StoreImportOptions) {
    assert.isDefined(options.name, 'Name not defined')
    assert.isName(options.name)

    const entry = new Entry(options.name)
    if (entry.exists()) throw new Error(`Entry ${options.name} already exists`)

    if (check.isDefined(options.file)) return entry.import({file: options.file})
    if (check.isDefined(options.content)) return entry.store(options.content)
    throw new Error(`File and content not defined`)
}
