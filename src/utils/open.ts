import {exec} from 'child_process'
import path from 'path'
import platform from './platform'

const executables: {[key: string]: string} = {
    darwin: 'open',
    linux: 'xdg-open',
    win32: 'explorer.exe',
    wsl: 'explorer.exe',
}

const executable = executables[platform.platform]
if (!executable) throw new Error(`Platform not supported`)

class Open {
    async resolve(file: string) {
        const resolved = path.resolve(file)
        if (platform.wsl) {
            return "'" + (await platform.wsl2win(resolved)) + "'"
        }
        return resolved
    }

    async file(file: string) {
        const resolved = await this.resolve(file)
        return new Promise<void>(resolve => {
            exec(executable + ' ' + resolved, () => resolve())
        })
    }

    async url(url: string) {
        return new Promise<void>(resolve => {
            exec(executable + ' ' + url, () => resolve())
        })
    }

    async code(file: string) {
        return new Promise<void>(resolve => {
            exec('code' + ' ' + file, () => resolve())
        })
    }
}

export default new Open()
