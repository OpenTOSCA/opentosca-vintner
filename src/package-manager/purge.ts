import {DEPENDENCY_FILE, LIB_DIRECTORY, TMP_DIRECTORY} from './consts'
import * as files from '../utils/files'
import * as utils from './utils'
import path from 'path'
import list from '../controller/templates/list'
import {Dependencies} from './types'

function main() {
    const dependencyList = gatherAllDependencies()
    console.log(dependencyList)

    const directories = files.readDir(LIB_DIRECTORY)
    for (const dir of directories) {
        if (dependencyList.has(dir) == false) {
            files.removeDirectory(path.join(LIB_DIRECTORY, dir))
            files.removeDirectory(path.join(TMP_DIRECTORY, dir))
            console.log(`Deleted ${dir}`)
        }
    }
}

function gatherAllDependencies(): Set<string> {
    const dependencyList = new Set<string>()
    // Add all deps from root dependency file
    const dependencies = utils.readDependencyFile()
    addDependenciesToList(dependencies, dependencyList)

    // Add all deps from sub dependency files
    const directories = files.readDir(LIB_DIRECTORY)
    let listSize
    do {
        listSize = dependencyList.size
        for (const dir of directories) {
            // Only consider directories of required dependencies
            if (dependencyList.has(dir)) {
                const subDependencyFilePath = path.join(TMP_DIRECTORY, dir, DEPENDENCY_FILE)

                // If dependency has a dependency file
                if (files.exists(subDependencyFilePath)) {
                    const subDependencies = utils.readCustomDependencyFile(subDependencyFilePath)
                    addDependenciesToList(subDependencies, dependencyList)
                }
            }
        }
    } while (listSize != dependencyList.size) // Repeat until no more changes

    return dependencyList
}

function addDependenciesToList(dependencies: Dependencies, list: Set<string>) {
    for (const dep of dependencies) {
        list.add(utils.getDirectoryNameForDependency(dep))
    }
}

main()
