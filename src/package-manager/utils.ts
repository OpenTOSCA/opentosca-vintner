import {DEPENDENCY_FILE, LIB_DIRECTORY} from './consts'
import {escapeRegExp} from 'lodash'
import * as fs from 'fs'
import {exec} from 'child_process'
import { DependencyFile, DependencyInfo } from './types'

/**
 * Returns full directory name: LIB_DIR/dependency_dir
 */
export function getFullDependencyDirectory(dependency: string): string {
    return LIB_DIRECTORY + '/' + dependency
}

/**
 * Replaces dots with slashes:
 * org.abc.module => org/abc/module
 */
export function domainToUrl(dir: string): string {
    return dir.replace(new RegExp(escapeRegExp('.'), 'g'), '/')
}

/**
 * Check if given directory exists
 */
export function checkDirectoryOrFileExists(dir: string): boolean {
    return fs.existsSync(dir)
}

/**
 * Create lib directory if it does not exist
 */
export function createLibDirectory(): void {
    if (!checkDirectoryOrFileExists(LIB_DIRECTORY)) {
        console.log('Creating lib directory')
        fs.mkdirSync(LIB_DIRECTORY)
    }
}

/**
 * Read the dependency file
 */
export function readDependencyFile(): DependencyFile {
    return JSON.parse(fs.readFileSync(DEPENDENCY_FILE).toString())
}

export function writeDependencyFile(dependencies: object) {
    let file: DependencyFile = {
        dependencies: dependencies
    }
    fs.writeFileSync(DEPENDENCY_FILE, JSON.stringify(file))
}

export function cleanup(): void {
    exec(`rm -rf ${LIB_DIRECTORY}/*`)
}