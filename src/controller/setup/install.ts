import * as files from '#files'
import {Shell} from '#shell'
import wsl from '#utils/wsl'
import path from 'path'

export type SetupInstallOptions = {
    all?: boolean
    utils?: boolean
    python?: boolean
    xopera?: boolean
    unfurl?: boolean
    gcloud?: boolean
    openstack?: boolean
    terraform?: boolean
    ansible?: boolean
}

export default async function (options: SetupInstallOptions) {
    // Ensure that platform is supported
    const platform = wsl.wsl ? 'wsl' : process.platform
    if (platform !== 'linux' && platform !== 'wsl') throw new Error(`This command only supports Linux`)

    // Shell
    const shell = new Shell()

    // Ensure apt is installed
    await shell.execute(['which apt &>/dev/null'])

    // Install git
    if (options.all || options.utils) {
        console.log('Installing utils')
        await install(shell, 'install-utils.sh')
    }

    // Install Python
    if (options.all || options.python) {
        console.log('Installing Python')
        await install(shell, 'install-python.sh')
    }

    // Install xOpera
    if (options.all || options.xopera) {
        console.log('Installing xOpera')
        await install(shell, 'install-xopera.sh')
    }

    // Install Unfurl
    if (options.all || options.unfurl) {
        console.log('Installing Unfurl')
        await install(shell, 'install-unfurl.sh')
    }

    // Install GCloud CLI
    if (options.all || options.gcloud) {
        console.log('Installing GCloud CLI')
        await install(shell, 'install-gcloud.sh')
    }

    // Install OpenStack CLI
    if (options.all || options.openstack) {
        console.log('Installing OpenStack CLI')
        await install(shell, 'install-openstack.sh')
    }

    // Install Terraform
    if (options.all || options.terraform) {
        console.log('Installing Terraform')
        await install(shell, 'install-terraform.sh')
    }

    // Install Ansible
    if (options.all || options.ansible) {
        console.log('Installing Ansible')
        await install(shell, 'install-ansible.sh')
    }
}

async function install(shell: Shell, script: string) {
    const file = files.temporary(script)
    files.copy(path.join(files.SCRIPTS_DIR, script), file)
    await shell.script({file})
}
