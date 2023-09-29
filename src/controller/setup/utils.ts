import * as files from '#files'
import {Shell} from '#shell'
import wsl from '#utils/wsl'
import path from 'path'

export type SetupUtilsOptions = {
    all?: boolean
    git?: boolean
    python?: boolean
    xopera?: boolean
    unfurl?: boolean
    gcloud?: boolean
    terraform?: boolean
    ansible?: boolean
}

export default async function (options: SetupUtilsOptions) {
    // Ensure that platform is supported
    const platform = wsl.wsl ? 'wsl' : process.platform
    if (platform !== 'linux' && platform !== 'wsl') throw new Error(`This command only supports linux`)

    // Shell
    const shell = new Shell()

    // Install git
    if (options.all || options.git) {
        console.log('Installing Git')
        await install(shell, 'install-git.sh')
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

    // Install gCloud
    if (options.all || options.gcloud) {
        console.log('Installing gCloud')
        await install(shell, 'install-gcloud.sh')
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
