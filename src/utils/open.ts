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

async function resolve(file: string) {
    const resolved = path.resolve(file)
    if (platform.wsl) {
        return "'" + (await platform.wsl2win(resolved)) + "'"
    }
    return resolved
}

async function file(file: string) {
    const resolved = await resolve(file)
    return new Promise<void>(resolve => {
        exec(executable + ' ' + resolved, () => resolve())
    })
}

async function url(url: string) {
    return new Promise<void>(resolve => {
        exec(executable + ' ' + url, () => resolve())
    })
}

async function code(file: string) {
    return new Promise<void>(resolve => {
        exec('code' + ' ' + file, () => resolve())
    })
}

export default {
    resolve,
    file,
    url,
    code,
}
