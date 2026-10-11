import * as assert from '#assert'
import * as check from '#check'
import * as files from '#files'
import std from '#std'
import * as utils from '#utils'
import death from '#utils/death'
import platform from '#utils/platform'
import {ChildProcessByStdio, spawn} from 'child_process'
import path from 'path'
import * as stream from 'stream'

/**
 * Command part which is passed to the shell as it is, i.e., without quoting.
 * Use this only for trusted shell syntax, e.g., "&&" or ">".
 */
export class Raw {
    readonly value: string

    constructor(value: string) {
        this.value = value
    }
}

export function raw(value: string) {
    return new Raw(value)
}

/**
 * Quotes a command part such that the shell treats it as a single argument
 */
export function quote(part: string | Raw) {
    if (part instanceof Raw) return part.value
    if (/^[\w/.:=@%+,-]+$/.test(part)) return part
    return `'${part.replace(/'/g, `'\\''`)}'`
}

/**
 * Quotes a directory but keeps a leading "~" for tilde expansion
 */
export function quoteDirectory(directory: string) {
    if (directory === '~') return directory
    if (directory.startsWith('~/')) return '~/' + quote(directory.slice(2))
    return quote(directory)
}

function environment(env: {[key: string]: string}) {
    return Object.entries(env).map(([key, value]) => {
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) throw new Error(`Environment variable "${key}" not allowed`)
        return raw(`${key}=${quote(value)}`)
    })
}

export class Shell {
    private readonly wsl: boolean
    protected readonly silent: boolean

    constructor(wsl = false, silent = false) {
        this.wsl = wsl
        this.silent = silent
    }

    /**
     * Resolves path considering WSL.
     * For example, C:\a\b returns /mnt/c/a/b if WSL is used.
     */
    resolve(file: string) {
        if (this.wsl) return platform.win2wsl(file)
        return path.resolve(file)
    }

    async script(
        options: {
            file?: string
            content?: string
            asset?: string
        } & {
            sudo?: boolean
            env?: {[key: string]: string}
        }
    ) {
        options.sudo = options.sudo ?? false
        options.env = options.env ?? {}

        // If content, then store it as file
        if (check.isDefined(options.content)) {
            options.file = files.temporaryDirent()
            files.storeFile(options.file, options.content)
        }

        // If asset, then copy asset from within binary to filesystem
        if (check.isDefined(options.asset)) {
            options.file = files.temporaryDirent(options.asset)
            files.copy(path.join(files.SCRIPTS_DIR, options.asset), options.file)
        }

        assert.isDefined(options.file, 'File is not defined')
        const resolved = this.resolve(options.file)

        // Set environment and use "sudo" (after setting environment)
        const command = [...environment(options.env), resolved]
        if (options.sudo) command.unshift('sudo')

        // Execute script
        await this.execute(['chmod', '+x', resolved])
        await this.execute(command)
    }

    async execute(parts: (string | Raw)[], options: {cwd?: string; env?: {[key: string]: string}} = {}) {
        return new Promise((resolve, reject) => {
            // Set environment
            const command = [...environment(options.env ?? {}), ...parts].map(quote).join(' ')

            if (!this.silent) {
                std.log(
                    utils.joinNotNull([
                        'Executing',
                        this.wsl ? 'on WSL' : 'locally',
                        check.isDefined(options.cwd) ? `in directory "${options.cwd}"` : undefined,
                        `the command "${command}"`,
                    ])
                )
            }

            let child: ChildProcessByStdio<stream.Writable, null, null>
            if (this.wsl) {
                child = spawn('wsl', {stdio: ['pipe', process.stderr, process.stderr], cwd: options.cwd})
                child.stdin.write(command)
                child.stdin.end()
            } else {
                child = spawn(command, {
                    shell: '/usr/bin/bash',
                    stdio: ['pipe', process.stderr, process.stderr],
                    cwd: options.cwd,
                })
            }

            death.register({
                stop: function () {
                    if (check.isDefined(child)) child.kill()
                },
            })

            child.on('error', error => {
                std.log(error.message)
                reject(error)
            })

            child.on('close', code => {
                if (!this.silent) std.log(`Command exited with code ${code}`)

                if (code === 0) {
                    resolve(code)
                } else {
                    reject(code)
                }
            })
        })
    }
}
