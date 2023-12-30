import * as check from '#check'
import * as files from '#files'
import {Shell} from '#shell'
import wsl from '#utils/wsl'
import path from 'path'

export default class Installer {
    private shell = new Shell()

    async attest() {
        // Ensure that platform is supported
        const platform = wsl.wsl ? 'wsl' : process.platform
        if (platform !== 'linux' && platform !== 'wsl') throw new Error(`This command only supports Linux`)
    }

    async install(options: {script: string; sudo?: boolean}) {
        options.sudo = check.isDefined(options.sudo) ?? false
        const file = files.temporary(options.script)
        files.copy(path.join(files.SCRIPTS_DIR, options.script), file)
        await this.shell.script({file, sudo: options.sudo})
    }
}
