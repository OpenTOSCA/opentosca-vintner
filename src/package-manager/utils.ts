import Papa from 'papaparse'
import * as files from '../utils/files'
import path from 'path'
import {Dependencies, Dependency} from './dependency'

export const LIB_DIRECTORY = 'lib'
export const TMP_DIRECTORY = path.join(files.temporaryPath('vintner-package-manager'))
export const DEPENDENCY_FILE = 'dependencies'

export function readDependencies(path: string = DEPENDENCY_FILE): Dependencies {
    return Papa.parse<string[]>(files.loadFile(path), {
        skipEmptyLines: true,
        delimiter: ' ',
    }).data.map(data => new Dependency(data[0], data[1], data.length >= 2 ? data[2] : 'main'))
}

export function readAllDependencies(): Set<string> {
    const dependencyList = new Set<string>()
    // Add all deps from root dependency file
    const dependencies = readDependencies()
    addDependenciesToList(dependencies, dependencyList)

    // Add all deps from sub dependency files
    const directories = files.readDirectory(LIB_DIRECTORY)
    let listSize
    do {
        listSize = dependencyList.size
        for (const dir of directories) {
            // Only consider directories of required dependencies
            if (dependencyList.has(dir)) {
                const subDependencyFilePath = path.join(LIB_DIRECTORY, dir, DEPENDENCY_FILE)

                // If dependency has a dependency file
                if (files.exists(subDependencyFilePath)) {
                    const subDependencies = readDependencies(subDependencyFilePath)
                    addDependenciesToList(subDependencies, dependencyList)
                }
            }
        }
    } while (listSize != dependencyList.size) // Repeat until no more changes

    return dependencyList
}

function addDependenciesToList(dependencies: Dependencies, list: Set<string>) {
    for (const dep of dependencies) {
        list.add(dep.id)
    }
}
