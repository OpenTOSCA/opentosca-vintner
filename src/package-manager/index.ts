import {Dependencies, Dependency} from './dependency'
import {DependencyFile} from './dependency-file'
import * as files from '../utils/files'
import path from 'path'
import config from '../utils/config'

export default {add, upgrade, remove, install, list, clean, purge, validate}

async function install() {
    console.log('Installing dependencies')
    await _installAll(new DependencyFile())
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
    const dependencies = _readAllDependencies()
    const directories = files.readDirectory(config.libDir)
    for (const dir of directories) {
        if (!dependencies.has(dir)) {
            files.removeDirectory(path.join(config.libDir, dir))
            files.removeDirectory(path.join(config.packageCacheDir, dir))
            console.log(`Purged ${dir}`)
        }
    }
}

async function purge() {
    console.log('Purging all dependencies')
    files.removeDirectory(config.libDir)
    files.removeDirectory(config.packageCacheDir)
}

async function validate() {
    new DependencyFile().read()
}

async function _install(dependency: Dependency) {
    await dependency.install()
    await _installAll(new DependencyFile(dependency.dependencyFile))
}

async function _installAll(file: DependencyFile) {
    if (!file.exists()) return console.log(`Dependencies file not found at "${file.path}"`)

    for (const dependency of file.read()) {
        console.log('-------------------------------------------------')
        await dependency.install()
        console.log('-------------------------------------------------')
    }
}

// TODO: rework this
function _readAllDependencies(): Set<string> {
    const dependencyList = new Set<string>()
    // Add all deps from root dependency file
    const dependencies = new DependencyFile().read()
    _addDependenciesToList(dependencies, dependencyList)

    // Add all deps from sub dependency files
    const directories = files.readDirectory(config.libDir)
    let listSize
    do {
        listSize = dependencyList.size
        for (const dir of directories) {
            // Only consider directories of required dependencies
            if (dependencyList.has(dir)) {
                const subDependencyFilePath = path.join(config.libDir, dir, config.dependencyFile)

                // If dependency has a dependency file
                if (files.exists(subDependencyFilePath)) {
                    const subDependencies = new DependencyFile(subDependencyFilePath).read()
                    _addDependenciesToList(subDependencies, dependencyList)
                }
            }
        }
    } while (listSize != dependencyList.size) // Repeat until no more changes

    return dependencyList
}

function _addDependenciesToList(dependencies: Dependencies, list: Set<string>) {
    for (const dep of dependencies) {
        list.add(dep.id)
    }
}
