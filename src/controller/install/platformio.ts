import * as assert from '#assert'
import {Shell} from '#shell'
import std from '#std'

export type InstallPlatformIOOptions = {}

export default async function (options: InstallPlatformIOOptions) {
    std.log('Installing PlatformIO Core CLI')

    assert.isLinux()
    await new Shell().script({asset: 'install-platformio.sh'})

    std.log('PlatformIO Core CLI installed')
}
