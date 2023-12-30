import Installer from '#controller/install/installer'
import std from '#std'

export type InstallTerraformOptions = {}

export default async function (options: InstallTerraformOptions) {
    std.log('Installing Terraform')

    const installer = new Installer()
    await installer.attest()
    await installer.install({script: 'install-terraform.sh', sudo: true})

    std.log('Terraform installed')
}
