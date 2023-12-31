import * as assert from '#assert'
import {Shell} from '#shell'
import std from '#std'

export type InstallGCloudOptions = {}

export default async function (options: InstallGCloudOptions) {
    std.log('Installing GCloud')

    assert.isLinux()
    await new Shell().script({asset: 'install-gcloud.sh'})

    std.log('GCloud installed')
}
