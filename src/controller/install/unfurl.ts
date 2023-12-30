import Installer from '#controller/install/installer'
import std from '#std'

// TODO: venv

export type InstallUnfurlOptions = {}

export default async function (options: InstallUnfurlOptions) {
    std.log('Installing Unfurl')

    const installer = new Installer()
    await installer.attest()
    await installer.install({script: 'install-unfurl.sh', sudo: true})

    std.log('Unfurl installed')
}
