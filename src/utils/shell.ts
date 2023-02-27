import {spawn, ChildProcessByStdio} from 'child_process'
import path from 'path'
import wsl from '#utils/wsl'
import death from '#utils/death'
import * as stream from 'stream'
import * as validator from '#validator'

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

    async execute(parts: string[]) {
        return new Promise((resolve, reject) => {
            const command = parts.join(' ')
            console.log(`Executing ${this.wsl ? 'on WSL' : 'locally'} the command`, command)

            let child: ChildProcessByStdio<stream.Writable, null, null>
            if (this.wsl) {
                child = spawn('wsl', {stdio: ['pipe', process.stdout, process.stdout]})
                child.stdin.write(command)
                child.stdin.end()
            } else {
                child = spawn(command, {shell: true, stdio: ['pipe', process.stdout, process.stdout]})
            }

            death.register({
                stop: function () {
                    if (validator.isDefined(child)) child.kill()
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
