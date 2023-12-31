import * as assert from '#assert'
import {Shell} from '#shell'
import std from '#std'

export type InstallxOperaOptions = {}

export default async function (options: InstallxOperaOptions) {
    std.log('Installing xOpera')

    assert.isLinux()
    await new Shell().script({asset: 'install-xopera.sh'})

    std.log('xOpera installed')
}
