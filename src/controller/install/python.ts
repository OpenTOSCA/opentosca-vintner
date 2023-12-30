import Installer from '#controller/install/installer'
import std from '#std'

export type InstallPythonOptions = {}

export default async function (options: InstallPythonOptions) {
    std.log('Installing Python')

    const installer = new Installer()
    await installer.attest()
    await installer.install({script: 'install-python.sh', sudo: true})

    std.log('Python installed')
}
