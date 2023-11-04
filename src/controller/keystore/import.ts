import * as assert from '#assert'
import {Key} from '#repository/keystore'

export type KeysImportOptions = {key: string; file: string}

export default async function (options: KeysImportOptions) {
    assert.isDefined(options.key, 'Key not defined')
    assert.isName(options.key)

    const key = new Key(options.key)
    if (key.exists()) throw new Error(`Key ${options.key} already exists`)
    await key.import(options)
}
