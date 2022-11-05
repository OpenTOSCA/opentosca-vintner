import {Dependencies, Dependency, LIB_DIRECTORY, CACHE_DIRECTORY} from './dependency'
import {DEPENDENCY_FILE, DependencyFile} from './dependency-file'
import * as files from '../utils/files'
import path from 'path'

export default {add, upgrade, remove, install, list, clean: clean, purge: purge, validate}

// TODO: when to create cache dir?

async function install() {
    console.log('Installing dependencies')

    const file = new DependencyFile()
    if (!file.exists()) return console.log('Dependencies file not found')

    return Promise.all(file.read().map(_install))
}

async function add(name: string, checkout: string, repo: string) {
    const dependency = new Dependency(name, checkout, repo)
    new DependencyFile().add(dependency)
    await _install(dependency)
}

async function upgrade(name: string, checkout: string) {
    const file = new DependencyFile()
    const dependency = file.get(name, checkout)
    if (!dependency) return console.log(`${dependency} not found`)

    await dependency.upgrade()
}

async function remove(name: string, checkout: string) {
    const file = new DependencyFile()
    const dependency = file.get(name, checkout)
    if (!dependency) return console.log(`${dependency} not found`)

    await dependency.remove()
    file.remove(dependency)
}

async function list() {
    console.log('Listing dependencies')
    new DependencyFile().read().forEach(dependency =>
        console.log({
            id: dependency.id,
            name: dependency.name,
            repo: dependency.repo,
            checkout: dependency.checkout,
        })
    )
}

async function clean() {
    console.log('Cleaning up unused dependencies')

    const dependencies = readAllDependencies()
    console.log(dependencies)

    const directories = files.readDirectory(LIB_DIRECTORY)
    for (const dir of directories) {
        if (!dependencies.has(dir)) {
            files.removeDirectory(path.join(LIB_DIRECTORY, dir))
            files.removeDirectory(path.join(CACHE_DIRECTORY, dir))
            console.log(`Purged ${dir}`)
        }
    }
}

async function purge() {
    console.log('Purging all dependencies')
    files.removeDirectory(LIB_DIRECTORY)
    files.removeDirectory(CACHE_DIRECTORY)
}

async function validate() {
    // TODO: validate
    throw new Error('Not Implemented')
}

// TODO: rework this
function readAllDependencies(): Set<string> {
    const dependencyList = new Set<string>()
    // Add all deps from root dependency file
    const dependencies = new DependencyFile().read()
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
                    const subDependencies = new DependencyFile(subDependencyFilePath).read()
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

async function _install(dependency: Dependency) {
    await dependency.install()
    const dependencies = await dependency.getDependencies()
    return Promise.all(dependencies.map(it => it.install()))
}
