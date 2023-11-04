import * as assert from '#assert'
import * as crypto from '#crypto'
import * as files from '#files'
import path from 'path'

export type KeysInspectOptions = {key?: string; output?: string}

export default async function (options: KeysInspectOptions) {
    assert.isDefined(options.key, 'Key not defined')
    assert.isName(options.key)

    options.output = options.output ?? path.resolve()
    assert.isDefined(options.output, 'Output not defined')

    const key = await crypto.generateKey()
    files.storeFile(path.join(options.output, options.key + '.public'), key.public)
    files.storeFile(path.join(options.output, options.key + '.private'), key.private)
}
