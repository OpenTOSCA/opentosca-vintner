import {spawn} from 'child_process'
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

    async execute(parts: string[]): Promise<number> {
        return new Promise((resolve, reject) => {
            const command = parts.join(' ')
            console.log(`Executing ${this.wsl ? 'on WSL' : 'locally'} the command`, command)

            let child
            if (this.wsl) {
                child = spawn('wsl')
                child.stdin.write(command)
                child.stdin.end()
            } else {
                child = spawn(command, {shell: true})
            }

            child.stdout.on('data', data => {
                console.log(data.toString())
            })

            child.stderr.on('data', data => {
                console.log(data.toString())
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
