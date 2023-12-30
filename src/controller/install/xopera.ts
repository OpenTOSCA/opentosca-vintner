import Installer from '#controller/install/installer'
import {xOperaNativeConfig} from '#plugins/xopera'
import std from '#std'

// TODO: venv

export type InstallxOperaOptions = xOperaNativeConfig

export default async function (options: InstallxOperaOptions) {
    std.log('Installing xOpera')

    // TODO: env?

    const installer = new Installer()
    await installer.attest()
    await installer.install({script: 'install-xopera.sh'})

    std.log('xOpera installed')
}
