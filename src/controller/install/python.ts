import * as assert from '#assert'
import {Shell} from '#shell'
import std from '#std'

export type InstallPythonOptions = {}

export default async function (options: InstallPythonOptions) {
    std.log('Installing Python')

    assert.isLinux()
    await new Shell().script({asset: 'install-python.sh'})

    std.log('Python installed')
}
