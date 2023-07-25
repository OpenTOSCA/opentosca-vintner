import * as check from '#check'
import * as crypto from '#crypto'
import archiver from 'archiver'
import axios from 'axios'
import * as ejs from 'ejs'
import extract from 'extract-zip'
import * as fs from 'fs'
import * as extra from 'fs-extra'
import * as yaml from 'js-yaml'
import _ from 'lodash'
import os from 'os'
import * as path from 'path'
import {async as syncDirectory} from 'sync-directory'
import xml2js from 'xml2js'
import * as utils from './utils'

export const ASSETS_DIR = path.resolve(__dirname, '..', 'assets')
export const TEMPLATES_DIR = path.resolve(ASSETS_DIR, 'templates')

export function exists(file: string) {
    return fs.existsSync(file)
}

export function assertFile(file: string) {
    if (!isFile(file)) throw new Error(`File "${file}" does not exist`)
}

export function assertDirectory(dir: string, file = false) {
    if (file) {
        assertDirectory(path.dirname(dir))
    } else {
        if (!isDirectory(dir)) throw new Error(`Directory "${dir}" does not exist`)
    }
}

export function isEmpty(dir: string) {
    const resolved = path.resolve(dir)
    return fs.readdirSync(resolved).length === 0
}

export function assertEmpty(dir: string) {
    const resolved = path.resolve(dir)
    if (!isEmpty(resolved)) throw new Error(`Directory "${resolved}" is not empty`)
}

export function isFile(path: string) {
    return exists(path) && fs.lstatSync(path).isFile()
}

export function isDirectory(path: string) {
    return exists(path) && fs.lstatSync(path).isDirectory()
}

export function getSize(file: string) {
    assertFile(file)
    return fs.lstatSync(file).size
}

export function countLines(file: string) {
    assertFile(file)
    return fs.readFileSync(path.resolve(file), 'utf-8').split(/\r?\n/).length
}

export function isLink(path: string) {
    return path.startsWith('http://') || path.startsWith('https://')
}

export function loadFile(file: string) {
    assertFile(file)
    return fs.readFileSync(path.resolve(file), 'utf-8')
}

export function loadYAML<T>(file: string) {
    return yaml.load(loadFile(file)) as T
}

export function storeFile(file: string, data: string, options?: {onlyIfChanged?: boolean}) {
    // Write file only if changed, e.g., to prevent updating the file mtime
    if (options?.onlyIfChanged) {
        if (exists(file)) {
            if (crypto.checksum(data) == crypto.checksum(loadFile(file))) {
                return
            }
        }
    }

    fs.writeFileSync(path.resolve(file), data)
    return file
}

export function storeYAML(file: string, data: any | string) {
    fs.writeFileSync(path.resolve(file), check.isString(data) ? data : toYAML(data))
    return file
}

export function storeJSON(file: string, data: any | string) {
    fs.writeFileSync(path.resolve(file), check.isString(data) ? data : toJSON(data))
    return file
}

export function storeENV(file: string, data: any | string) {
    fs.writeFileSync(path.resolve(file), check.isString(data) ? data : toENV(data))
    return file
}

export async function loadXML<T>(file: string) {
    return (await xml2js.parseStringPromise(loadFile(file) /*, options */)) as T
}

export function toYAML(obj: any, options?: yaml.DumpOptions) {
    return yaml.dump(
        obj,
        _.merge(
            {
                styles: {
                    '!!null': 'empty',
                },
            },
            options
        )
    )
}

export function toJSON(obj: any) {
    return utils.pretty(obj)
}

export function toENV(obj: {[key: string]: string | number | boolean}) {
    return Object.entries(obj)
        .map(([key, value]) => `${key}="${value}"`)
        .join(`\n`)
}

export function copy(source: string, target: string) {
    extra.copySync(path.resolve(source), path.resolve(target))
}

export function listDirectories(directory: string): string[] {
    return fs
        .readdirSync(directory, {withFileTypes: true})
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name.toString())
}

export function listFiles(directory: string): string[] {
    return fs
        .readdirSync(directory, {withFileTypes: true})
        .filter(dirent => dirent.isFile())
        .map(dirent => dirent.name.toString())
}

export function createDirectory(directory: string) {
    const resolved = path.resolve(directory)
    if (!fs.existsSync(resolved)) {
        fs.mkdirSync(resolved, {recursive: true})
    }
}

export function removeDirectory(directory: string) {
    const resolved = path.resolve(directory)
    fs.rmSync(resolved, {recursive: true, force: true})
}

export function getDirectory(file: string) {
    return path.parse(path.resolve(file)).dir
}

export function getFilename(file: string) {
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
    assertDirectory(target, true)
    return new Promise<void>((resolve, reject) => {
        const archive = archiver('zip', {zlib: {level: 9}})
        const stream = fs.createWriteStream(target)

        archive
            .directory(source, false)
            .on('error', err => reject(err))
            .pipe(stream)

        stream.on('close', () => resolve())
        archive.finalize()
    })
}

export async function download(source: string, target: string = temporary()): Promise<string> {
    return new Promise((resolve, reject) => {
        axios
            .get(source, {
                responseType: 'stream',
            })
            .then(response => {
                const file = fs.createWriteStream(target)
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

export function temporary(name?: string) {
    return path.join(os.tmpdir(), name || crypto.generateNonce())
}

export async function renderFile(source: string, data: ejs.Data, target?: string): Promise<string> {
    return new Promise((resolve, reject) => {
        ejs.renderFile(source, data, (error, data) => {
            if (check.isDefined(error)) return reject(error)
            if (check.isDefined(target)) storeFile(target, data)
            return resolve(data)
        })
    })
}

export function stat(file: string) {
    return fs.statSync(file)
}

export async function sync(source: string, target: string) {
    await syncDirectory(path.resolve(source), path.resolve(target))
}
