import Installer from '#controller/install/installer'
import std from '#std'

export type InstallAnsibleOptions = {}

export default async function (options: InstallAnsibleOptions) {
    std.log('Installing Ansible')

    const installer = new Installer()
    await installer.attest()
    await installer.install({script: 'install-ansible.sh', sudo: true})

    std.log('Ansible installed')
}
