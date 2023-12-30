import Installer from '#controller/install/installer'
import std from '#std'

// TODO: venv

export type InstallxOperaOptions = {}

export default async function (options: InstallxOperaOptions) {
    std.log('Installing xOpera')

    const installer = new Installer()
    await installer.attest()
    await installer.install({script: 'install-xopera.sh', sudo: true})

    std.log('xOpera installed')
}
