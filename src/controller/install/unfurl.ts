import * as assert from '#assert'
import {Shell} from '#shell'
import std from '#std'

export type InstallUnfurlOptions = {}

export default async function (options: InstallUnfurlOptions) {
    std.log('Installing Unfurl')

    assert.isLinux()
    await new Shell().script({asset: 'install-unfurl.sh'})

    std.log('Unfurl installed')
}
