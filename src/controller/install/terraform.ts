import * as assert from '#assert'
import {Shell} from '#shell'
import std from '#std'

export type InstallTerraformOptions = {}

export default async function (options: InstallTerraformOptions) {
    std.log('Installing Terraform')

    assert.isLinux()
    await new Shell().script({asset: 'install-terraform.sh'})

    std.log('Terraform installed')
}
