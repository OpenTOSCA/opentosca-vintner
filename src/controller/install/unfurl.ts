import Installer from '#controller/install/installer'
import std from '#std'

export type InstallUnfurlOptions = {}

export default async function (options: InstallUnfurlOptions) {
    std.log('Installing Unfurl')

    const installer = new Installer()
    await installer.attest()
    await installer.install({script: 'install-unfurl.sh'})

    std.log('Unfurl installed')
}
