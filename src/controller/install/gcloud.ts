import Installer from '#controller/install/installer'
import std from '#std'

export type InstallGCloudOptions = {}

export default async function (options: InstallGCloudOptions) {
    std.log('Installing GCloud')

    const installer = new Installer()
    await installer.attest()
    await installer.install({script: 'install-gcloud.sh', sudo: true})

    std.log('GCloud installed')
}
