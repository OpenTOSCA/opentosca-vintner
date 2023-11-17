import * as assert from '#assert'
import {Entry} from '#repository/store'

export type StoreContentOptions = {name?: string}

export default async function (options: StoreContentOptions) {
    assert.isDefined(options.name, 'Name not defined')
    const entry = new Entry(options.name)
    return entry.load()
}
