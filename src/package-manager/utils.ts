import {DEPENDENCY_FILE, LIB_DIRECTORY, TMP_DIRECTORY} from './consts'
import {escapeRegExp} from 'lodash'
import {exec} from 'child_process'
import {Dependencies, Dependency} from './types'
import * as files from '../utils/files'
import Papa from 'papaparse'
import path from 'path'

/**
 * Get the temporary directory for a dependency
 */
export function getTemporaryCloneDirectory(dependency: Dependency): string {
    const dir = getDirectoryNameForDependency(dependency)
    return path.join(TMP_DIRECTORY, dir)
}

/**
 * Get the lib directory for a dependency
 */
export function getLibDirectory(dependency: Dependency): string {
    const dir = getDirectoryNameForDependency(dependency)
    return path.join(LIB_DIRECTORY, dir)
}

/**
 * Get directory name for a dependency:
 *
 * directory:checkout
 */
function getDirectoryNameForDependency(dependency: Dependency): string {
    return dependency.dir + ':' + dependency.checkout
}

/**
 * Replaces dots with slashes:
 * org.abc.module => org/abc/module
 */
export function domainToUrl(dir: string): string {
    return dir.replace(new RegExp(escapeRegExp('.'), 'g'), '/')
}

/**
 * Read the dependency file
 */
export function readDependencyFile(): Dependencies {
    let dependencies: Dependencies = []
    dependencies = Papa.parse<Dependency>(files.loadFile(DEPENDENCY_FILE), {
        skipEmptyLines: true,
        header: true,
        delimiter: ' ',
    }).data
    return dependencies
}

export function cleanup(): void {
    exec(`rm -rf ${LIB_DIRECTORY}/*`)
}
