import * as assert from '#assert'
import {Shell} from '#shell'
import std from '#std'

export type InstallAnsibleOptions = {}

export default async function (options: InstallAnsibleOptions) {
    std.log('Installing Ansible')

    assert.isLinux()
    await new Shell().script({asset: 'install-ansible.sh'})

    std.log('Ansible installed')
}
