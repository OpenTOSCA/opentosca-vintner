import * as assert from '#assert'
import {Entry} from '#repository/store'

export type StoreDeleteOptions = {name?: string}

export default async function (options: StoreDeleteOptions) {
    assert.isDefined(options.name, 'Name not defined')
    const entry = new Entry(options.name)
    await entry.delete()
}
