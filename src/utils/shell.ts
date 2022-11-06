import {spawn, SpawnOptionsWithoutStdio} from 'child_process'
import path from 'path'

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
        const resolved = path.resolve(file)
        if (this.wsl) {
            const root = path.parse(resolved).root
            const disk = root.split(':')[0].toLowerCase()
            return resolved.replace(root, `/mnt/${disk}/`).replace(/\\/g, '/')
        }
        return resolved
    }

    // TODO: cwd will not work if wsl is enabled
    async execute(
        parts: string[],
        options?: {cwd?: string; resolve?: boolean}
    ): Promise<{success: true; output: string; code: number} | {success: false; output: string; code: number}> {
        return new Promise((resolve, reject) => {
            const command = parts.join(' ')
            console.log(`Executing ${this.wsl ? 'on WSL' : 'locally'} the command`, command)

            let child
            if (this.wsl) {
                child = spawn('wsl', {cwd: options?.cwd})
                child.stdin.write(command)
                child.stdin.end()
            } else {
                child = spawn(command, {shell: true, cwd: options?.cwd})
            }

            let output = ''

            child.stdout.on('data', data => {
                const decoded = data.toString()
                output += decoded
                console.log(decoded)
            })

            child.stderr.on('data', data => {
                const decoded = data.toString()
                output += decoded
                console.log(decoded)
            })

            child.on('error', error => {
                console.log(error.message)
                reject(error)
            })

            child.on('close', code => {
                console.log(`Command exited with code ${code}`)

                if (code === 0) return resolve({success: true, code, output})
                if (options?.resolve) return resolve({success: false, code: code ?? -1, output})
                return reject({success: false, code, output})
            })
        })
    }
}
