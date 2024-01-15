import * as assert from '#assert'
import {Shell} from '#shell'
import std from '#std'

export type InstallUtilsOptions = {}

export default async function (options: InstallUtilsOptions) {
    std.log('Installing utils')

    assert.isLinux()
    await new Shell().script({asset: 'install-utils.sh', sudo: true})

    std.log('Utils installed')
}
