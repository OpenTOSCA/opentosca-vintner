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
export function getDirectoryNameForDependency(dependency: Dependency): string {
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
    return readCustomDependencyFile(DEPENDENCY_FILE)
}

/**
 * Read the dependency file
 */
export function readCustomDependencyFile(path: string): Dependencies {
    let dependencies: Dependencies = []
    dependencies = Papa.parse<Dependency>(files.loadFile(path), {
        skipEmptyLines: true,
        header: true,
        delimiter: ' ',
    }).data
    return dependencies
}

export function cleanup(): void {
    exec(`rm -rf ${LIB_DIRECTORY}/*`)
}

export function gatherAllDependencies(): Set<string> {
    const dependencyList = new Set<string>()
    // Add all deps from root dependency file
    const dependencies = readDependencyFile()
    addDependenciesToList(dependencies, dependencyList)

    // Add all deps from sub dependency files
    const directories = files.readDir(LIB_DIRECTORY)
    let listSize
    do {
        listSize = dependencyList.size
        for (const dir of directories) {
            // Only consider directories of required dependencies
            if (dependencyList.has(dir)) {
                const subDependencyFilePath = path.join(LIB_DIRECTORY, dir, DEPENDENCY_FILE)

                // If dependency has a dependency file
                if (files.exists(subDependencyFilePath)) {
                    const subDependencies = readCustomDependencyFile(subDependencyFilePath)
                    addDependenciesToList(subDependencies, dependencyList)
                }
            }
        }
    } while (listSize != dependencyList.size) // Repeat until no more changes

    return dependencyList
}

function addDependenciesToList(dependencies: Dependencies, list: Set<string>) {
    for (const dep of dependencies) {
        list.add(getDirectoryNameForDependency(dep))
    }
}
