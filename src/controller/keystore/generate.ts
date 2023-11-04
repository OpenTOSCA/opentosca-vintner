import * as assert from '#assert'
import {Key} from '#repository/keystore'
export type KeysInspectOptions = {key: string; output: string}

export default async function (options: KeysInspectOptions) {
    assert.isDefined(options.key, 'Key not defined')
    assert.isName(options.key)

    const key = new Key(options.key)
    if (key.exists()) throw new Error(`Key "${options.key}" already exists`)

    // TODO: use output

    return key.generate()
}

// TODO: this does generate a keypair?!

// TODO: move this into utils
