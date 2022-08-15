import * as path from 'path'
import * as fs from 'fs'
import {copySync} from 'fs-extra'
import * as yaml from 'js-yaml'
import extract from 'extract-zip'
import os from 'os'
import * as utils from './utils'
import axios from 'axios'
import * as validator from './validator'

export function exists(file: string) {
    return fs.existsSync(file)
}

export function isFile(path: string) {
    return exists(path) && fs.lstatSync(path).isFile()
}

export function isDirectory(path: string) {
    return exists(path) && fs.lstatSync(path).isDirectory()
}

export function getSize(file: string) {
    if (!isFile(file)) throw new Error(`Can not read size of non file ${file}`)
    return fs.lstatSync(file).size
}

export function countLines(file: string) {
    if (!isFile(file)) throw new Error(`Can not read lines of non file ${file}`)
    return fs.readFileSync(path.resolve(file), 'utf-8').split(/\r?\n/).length
}

export function isLink(path: string) {
    return path.startsWith('http://') || path.startsWith('https://')
}

export function loadFile<T>(file: string) {
    if (!isFile(file)) throw new Error(`File ${file} does not exist`)
    return yaml.load(fs.readFileSync(path.resolve(file), 'utf-8')) as T
}

export function storeFile(file: string, data: any | string) {
    if (validator.isString(data)) {
        fs.writeFileSync(path.resolve(file), data)
    } else {
        fs.writeFileSync(path.resolve(file), stringify(data))
    }
    return file
}

export function stringify(obj: any) {
    return yaml.dump(obj, {
        indent: 4,
        styles: {
            '!!null': 'empty',
        },
    })
}

export function copy(source: string, target: string) {
    copySync(path.resolve(source), path.resolve(target))
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

export async function extractArchive(source: string, target: string) {
    await extract(source, {dir: target})
}

export async function download(source: string, target?: string): Promise<string> {
    if (validator.isUndefined(target)) target = temporaryFile()

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

export function temporaryFile(name?: string) {
    return path.join(os.tmpdir(), name || utils.generateNonce())
}
