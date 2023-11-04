import * as assert from '#assert'
import {Key} from '#repository/keystore'

export type KeysImportOptions = {key: string; path: string}

export default async function (options: KeysImportOptions) {
    const key = new Key(options.key)
    assert.isName(key.getName())
    if (key.exists()) throw new Error(`Key ${options.key} already exists`)
    await key.import(options)
}
