import * as assert from '#assert'
import {Key} from '#repository/keystore'

export type KeysDeleteOptions = {key?: string}

export default async function (options: KeysDeleteOptions) {
    assert.isDefined(options.key, 'Key not defined')
    const key = new Key(options.key)
    await key.delete()
}
