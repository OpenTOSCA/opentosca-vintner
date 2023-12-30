import Installer from '#controller/install/installer'
import std from '#std'

export type InstallUtilsOptions = {}

export default async function (options: InstallUtilsOptions) {
    std.log('Installing utils')

    const installer = new Installer()
    await installer.attest()
    await installer.install({script: 'install-utils.sh', sudo: true})

    std.log('Utils installed')
}
