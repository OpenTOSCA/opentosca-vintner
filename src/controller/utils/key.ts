import * as assert from '#assert'
export type KeysInspectOptions = {key: string; output: string}

export default async function (options: KeysInspectOptions) {
    assert.isDefined(options.key, 'Key not defined')
    assert.isName(options.key)

    // TODO: generate private and public key
}
