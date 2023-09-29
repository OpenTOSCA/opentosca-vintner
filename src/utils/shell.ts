import * as assert from '#assert'
import * as check from '#check'
import * as files from '#files'
import * as utils from '#utils'
import death from '#utils/death'
import wsl from '#utils/wsl'
import {ChildProcessByStdio, spawn} from 'child_process'
import path from 'path'
import * as stream from 'stream'

export class Shell {
    private readonly wsl: boolean

    constructor(wsl = false) {
        this.wsl = wsl
    }

    /**
     * Resolves path considering WSL.
     * For example, C:\a\b returns /mnt/c/a/b if WSL is used.
     */
    resolve(file: string) {
        if (this.wsl) return wsl.win2wsl(file)
        return path.resolve(file)
    }

    async script(options: {file?: string; content?: string}) {
        if (check.isDefined(options.content)) {
            options.file = files.temporary()
            files.storeFile(options.file, options.content)
        }
        assert.isDefined(options.file, 'File is not defined')
        const resolved = this.resolve(options.file)

        await this.execute(['chmod', '+x', resolved])
        await this.execute(['sudo', resolved])
    }

    async execute(parts: string[], options: {cwd?: string} = {}) {
        return new Promise((resolve, reject) => {
            const command = parts.join(' ')

            console.log(
                utils.joinNotNull([
                    'Executing',
                    this.wsl ? 'on WSL' : 'locally',
                    check.isDefined(options.cwd) ? `in directory "${options.cwd}"` : undefined,
                    `the command "${command}"`,
                ])
            )

            let child: ChildProcessByStdio<stream.Writable, null, null>
            if (this.wsl) {
                child = spawn('wsl', {stdio: ['pipe', process.stdout, process.stdout], cwd: options.cwd})
                child.stdin.write(command)
                child.stdin.end()
            } else {
                child = spawn(command, {
                    shell: true,
                    stdio: ['pipe', process.stdout, process.stdout],
                    cwd: options.cwd,
                })
            }

            death.register({
                stop: function () {
                    if (check.isDefined(child)) child.kill()
                },
            })

            child.on('error', error => {
                console.log(error.message)
                reject(error)
            })

            child.on('close', code => {
                console.log(`Command exited with code ${code}`)

                if (code === 0) {
                    resolve(code)
                } else {
                    reject(code)
                }
            })
        })
    }
}
