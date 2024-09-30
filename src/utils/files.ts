import * as assert from '#assert'
import * as check from '#check'
import * as crypto from '#crypto'
import std from '#std'
import Queue from '#utils/queue'
import archiver from 'archiver'
import axios from 'axios'
import * as ejs from 'ejs'
import extract from 'extract-zip'
import * as fss from 'fs'
import * as fse from 'fs-extra'
import * as ini from 'js-ini'
import * as yaml from 'js-yaml'
import lnk from 'lnk'
import _ from 'lodash'
import os from 'os'
import papa from 'papaparse'
import path from 'path'
// TODO: fix import problem
// @ts-ignore
import * as prettier from 'prettier'
import * as syncDirectory from 'sync-directory'
import xml2js from 'xml2js'
import * as utils from './utils'

export const ASSETS_DIR = path.resolve(__dirname, '..', 'assets')
export const PROFILES_DIR = path.resolve(ASSETS_DIR, 'profiles')
export const TEMPLATES_DIR = path.resolve(ASSETS_DIR, 'templates')
export const SCRIPTS_DIR = path.resolve(ASSETS_DIR, 'scripts')
export const TMP_PREFIX = 'opentosca-vintner--'

export const YAML_EXTENSIONS = ['yaml', 'yml']

export function exists(file: string) {
    return fss.existsSync(file)
}

export function assertFile(file: string) {
    if (!isFile(file)) throw new Error(`File "${file}" does not exist`)
}

export function assertDirectory(dir: string, options: {file?: boolean} = {}) {
    options.file = options.file ?? false
    if (options.file) {
        assertDirectory(path.dirname(dir))
    } else {
        if (!isDirectory(dir)) throw new Error(`Directory "${dir}" does not exist`)
    }
}

export function isEmpty(dir: string) {
    const resolved = path.resolve(dir)
    return fss.readdirSync(resolved).length === 0
}

export function assertEmpty(dir: string) {
    const resolved = path.resolve(dir)
    if (!isEmpty(resolved)) throw new Error(`Directory "${resolved}" is not empty`)
}

export function isFile(file: string) {
    return exists(file) && fss.lstatSync(file).isFile()
}

export function isDirectory(dir: string) {
    return exists(dir) && fss.lstatSync(dir).isDirectory()
}

export function getSize(file: string) {
    assertFile(file)
    return fss.lstatSync(file).size
}

export function countLines(file: string) {
    assertFile(file)
    return fss.readFileSync(path.resolve(file), 'utf-8').split(/\r?\n/).length
}

export function countNotBlankLines(file: string) {
    assertFile(file)
    return fss
        .readFileSync(path.resolve(file), 'utf-8')
        .split(/\r?\n/)
        .filter(it => it).length
}

export function isLink(link: string) {
    return link.startsWith('http://') || link.startsWith('https://')
}

export function loadFile(file: string) {
    assertFile(file)
    return fss.readFileSync(path.resolve(file), 'utf-8')
}

export function loadYAML<T>(file: string) {
    try {
        return yaml.load(loadFile(file)) as T
    } catch (e) {
        std.log(`Could not load yaml file "${file}"`)
        throw e
    }
}

export function storeFile(file: string, data: string, options: {onlyIfChanged?: boolean; overwrite?: boolean} = {}) {
    options.onlyIfChanged = options.onlyIfChanged ?? false
    options.overwrite = options.overwrite ?? true

    // Write file only if changed, e.g., to prevent updating the file mtime
    if (options.onlyIfChanged) {
        if (exists(file)) {
            if (crypto.checksum({content: data}) == crypto.checksum({content: loadFile(file)})) {
                return
            }
        }
    }

    fss.writeFileSync(path.resolve(file), data)
    return file
}

export function storeYAML<T>(file: string, data: T, options: {generated?: boolean; overwrite?: boolean} = {}) {
    options.generated = options.generated ?? false
    options.overwrite = options.overwrite ?? true

    const resolved = path.resolve(file)

    const notice = `
###################################################
#
# WARNING: Do not edit! This file is autogenerated!
#
###################################################

`.trimStart()

    let output = toYAML(data)
    if (options.generated) {
        output = notice + output
    }

    if (!options.overwrite) {
        if (exists(resolved)) return
    }

    storeFile(resolved, output, {overwrite: options.overwrite})
}

export function storeJSON(file: string, data: any | string) {
    storeFile(path.resolve(file), check.isString(data) ? data : toJSON(data))
    return file
}

export function storeENV(file: string, data: any | string) {
    storeFile(path.resolve(file), check.isString(data) ? data : toENV(data).join('\n'))
    return file
}

export function toXML(obj: any) {
    return new xml2js.Builder().buildObject(obj)
}

export async function loadXML<T>(file: string) {
    return (await xml2js.parseStringPromise(loadFile(file) /*, options */)) as T
}

export function toFormat(obj: any, format: string, options: {latex?: LatexOptions; csv?: CSVOptions} = {}) {
    if (format === 'yaml') return toYAML(obj)
    if (format === 'json') return toJSON(obj)
    if (format === 'ini') return toINI(obj)
    if (format === 'env') return toENV(obj)
    if (format === 'xml') return toXML(obj)
    if (format === 'latex') return toLatex(obj, options.latex)
    if (format === 'csv') return toCSV(obj, options.csv)

    throw new Error(`Format "${format}" not supported`)
}

export type LatexOptions = {
    headers?: string[]
}

export type CSVOptions = {
    headers?: string[]
}

export function toCSV(obj: any, options: CSVOptions = {}) {
    assert.isArray(obj)
    return papa.unparse(obj, {columns: options.headers})
}

export function toLatex(obj: any, options: LatexOptions = {}) {
    assert.isArray(obj)
    // TODO: this is dirty
    const list = obj as {[key: string]: any}[]

    // Collect all possible keys
    const defaultKeys = () => {
        const dk: string[] = []
        list.forEach(item => {
            Object.keys(item).forEach(key => keys.push(key))
        })
        return dk
    }

    const keys = options.headers ?? defaultKeys()

    const data = []

    /**
     * Header
     */
    data.push('\\toprule')
    data.push('index & ' + Array.from(keys).join(' & ') + '\\\\')
    data.push('\\midrule')

    /**
     * Entries
     */
    list.forEach((item, index) => {
        const tmp = [index]
        for (const key of keys) {
            const raw = item[key]
            // TODO: not latex safe
            const value = JSON.stringify(raw)
            tmp.push(raw)
        }
        data.push(tmp.join(' & ') + '\\\\')
    })

    /**
     * Footer
     */
    data.push('\\bottomrule')

    return data.join('\n')
}

export function formatYAML(obj: any) {
    return prettier.format(obj, {
        parser: 'yaml',
        endOfLine: 'lf',
        bracketSpacing: false,
        singleQuote: true,
        trailingComma: 'es5',
        arrowParens: 'avoid',
        tabWidth: 4,
        printWidth: 69420,
        semi: false,
    })
}

export function toYAML(obj: any, options?: yaml.DumpOptions) {
    return formatYAML(
        yaml.dump(
            obj,
            _.merge<yaml.DumpOptions, yaml.DumpOptions | undefined>(
                {
                    lineWidth: -1,
                    noRefs: true,
                    styles: {
                        '!!null': 'empty',
                    },
                },
                options
            )
        )
    )
}

export function toJSON(obj: any) {
    return utils.pretty(obj)
}

export function toENV(obj: {[key: string]: string | number | boolean}, options: {quote?: boolean} = {}) {
    options.quote = options.quote ?? true
    const quote = options.quote ? '"' : ''
    return Object.entries(obj).map(([key, value]) => `${key}=${quote}${value}${quote}`)
}

export function toINI(obj: any) {
    return utils.trim(ini.stringify(obj))
}

export function copy(source: string, target: string, options: {overwrite?: boolean} = {}) {
    options.overwrite = options.overwrite ?? true

    fse.copySync(path.resolve(source), path.resolve(target), {overwrite: options.overwrite})
}

export async function syncDirent(source: string, target: string) {
    await syncDirectory.async(source, target, {
        onError(error): any {
            throw error
        },
    })
}

export async function linkDirent(source: string, target: string) {
    try {
        await lnk(source, target, {force: true})
    } catch (e) {
        if ((e.message || '').includes('are the same')) return
        throw e
    }
}

export function listDirectories(directory: string): string[] {
    return fss
        .readdirSync(directory, {withFileTypes: true})
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name.toString())
}

export function listFiles(directory: string, options: {extensions?: string[]} = {}): string[] {
    options.extensions = options.extensions ?? []

    return fss
        .readdirSync(directory, {withFileTypes: true})
        .filter(dirent => dirent.isFile())
        .map(dirent => dirent.name.toString())
        .filter(it => {
            assert.isDefined(options.extensions)
            if (utils.isEmpty(options.extensions)) return true
            return options.extensions.some(ext => it.endsWith(ext))
        })
}

/**
 * Recursively walks through directory and return absolute path of each found file
 */
export function walkDirectory(directory: string, options: {extensions?: string[]} = {}): string[] {
    const files: string[] = []

    const dirs = new Queue<string>()
    dirs.add(path.resolve(directory))
    while (!dirs.isEmpty()) {
        const dir = dirs.next()
        listDirectories(dir).forEach(it => dirs.add(path.resolve(dir, it)))
        files.push(...listFiles(dir, {extensions: options.extensions}).map(it => path.join(dir, it)))
    }

    return files
}

export function createDirectory(directory: string) {
    const resolved = path.resolve(directory)
    if (!fss.existsSync(resolved)) {
        fss.mkdirSync(resolved, {recursive: true})
    }
}

export async function removeDirent(it: string) {
    if (!exists(it)) return

    if (isDirectory(it)) {
        removeDirectory(it)
    } else {
        await removeFile(it)
    }
}

export function removeDirectory(directory: string) {
    const resolved = path.resolve(directory)

    if (['/', '/etc', '/c', '/mnt', '/mnt/c', 'C:\\Windows\\system32', 'C:\\'].includes(resolved))
        throw new Error(`Deleting directory "${resolved}" not allowed`)

    fss.rmSync(resolved, {recursive: true, force: true})
}

export async function removeFile(file: string) {
    fss.unlinkSync(path.resolve(file))
}

export function getDirectory(file: string) {
    return path.parse(path.resolve(file)).dir
}

export function getBase(file: string) {
    return path.parse(path.resolve(file)).base
}

export function getName(file: string) {
    return path.parse(path.resolve(file)).name
}

export async function extractArchive(source: string, target: string) {
    await extract(source, {dir: target})
}

export async function createArchive(source: string, target: string) {
    assertDirectory(source)
    assertDirectory(target, {file: true})
    return new Promise<void>((resolve, reject) => {
        const archive = archiver('zip', {zlib: {level: 9}})
        const stream = fss.createWriteStream(target)

        archive
            .directory(source, false)
            .on('error', err => reject(err))
            .pipe(stream)

        stream.on('close', () => resolve())
        archive.finalize()
    })
}

export async function download(source: string, target: string = temporaryDirent()): Promise<string> {
    return new Promise((resolve, reject) => {
        axios
            .get(source, {
                responseType: 'stream',
            })
            .then(response => {
                const file = fss.createWriteStream(target)
                response.data.pipe(file)
                file.on('error', error => {
                    file.close()
                    reject(error)
                })

                file.on('finish', () => {
                    file.close()
                    resolve(target)
                })
            })
    })
}

export function temporaryDirent(name?: string) {
    return path.join(os.tmpdir(), TMP_PREFIX + (name || crypto.generateNonce()))
}

export async function renderFile(source: string, data: ejs.Data, target?: string): Promise<string> {
    return new Promise((resolve, reject) => {
        ejs.renderFile(source, data, (error, rendered) => {
            if (check.isDefined(error)) return reject(error)
            if (check.isDefined(target)) storeFile(target, rendered)
            return resolve(rendered)
        })
    })
}

export function statDirent(file: string) {
    return fss.statSync(file)
}
