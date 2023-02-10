import path from 'path'
import wsl from 'is-wsl'
import {exec} from 'child_process'

/**
 * Transforms windows path to WSL path.
 * For example, "C:\a\b" returns "/mnt/c/a/b".
 */
function win2wsl(file: string) {
    const resolved = path.resolve(file)
    const root = path.parse(resolved).root
    const disk = root.split(':')[0].toLowerCase()
    return resolved.replace(root, `/mnt/${disk}/`).replace(/\\/g, '/')
}

/**
 * Transform WSL path to windows path.
 * For example, "/mnt/c/a/b" returns "\\wsl.localhost\Ubuntu-22.04\a\b".
 */
async function wsl2win(file: string) {
    if (!wsl) throw new Error(`Can be only executed inside WSL`)
    return new Promise<string>((resolve, reject) => {
        exec('wslpath -w ' + path.resolve(file), (error, output) => {
            if (error) return reject(error)
            resolve(output.trim())
        })
    })
}

export default {
    win2wsl,
    wsl2win,
    wsl,
}
