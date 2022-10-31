import {exec, execSync} from 'child_process'
import {DEPENDENCY_FILE, LIB_DIRECTORY, TMP_DIRECTORY} from './consts'
import {Dependency, Dependencies} from './types'
import * as files from '../utils/files'
import * as utils from './utils'
import path from 'path'
import syncDirectory from 'sync-directory'

function main() {
    files.createDirectory(LIB_DIRECTORY)
    files.createDirectory(TMP_DIRECTORY)

    if (files.exists(DEPENDENCY_FILE) == false) {
        console.log('No dependencies file found')
        return
    }

    const dependencies = utils.readDependencyFile()

    installDependencies(dependencies)
}

/**
 * Install all dependencies from dependency file
 */
function installDependencies(dependencies: Dependencies): void {
    dependencies.forEach(dependency => {
        installDependency(dependency)
    })
}

/**
 * Install a single dependency
 */
function installDependency(dependency: Dependency): void {
    const tmpDir = utils.getTemporaryCloneDirectory(dependency)
    const libDir = utils.getLibDirectory(dependency)

    const dependencyName = utils.getDirectoryNameForDependency(dependency)
    if (files.exists(tmpDir)) {
        // Repo has already been cloned
        console.log(`Updating ${dependencyName}`)
        execSync(`git -C ${tmpDir} pull`) // pull latest
    } else {
        // TODO tag/commit
        console.log(`Installing ${dependencyName}`)
        execSync(`git clone --branch ${dependency.checkout} ${dependency.repo} ${tmpDir}`) // pull latest
    }
    syncDependencyFiles(dependency, tmpDir, libDir)

    const subDependencyFile = path.join(tmpDir, DEPENDENCY_FILE)
    if (files.exists(subDependencyFile)) {
        const subDependencies = utils.readCustomDependencyFile(subDependencyFile)
        installDependencies(subDependencies)
    }
}

/**
 * Sync the repo and the lib directory of a dependency
 */
function syncDependencyFiles(dependency: Dependency, tmpDir: string, libDir: string) {
    let desiredTmpPath = tmpDir
    dependency.dir.split('.').forEach(dir => {
        desiredTmpPath = path.join(desiredTmpPath, dir)
    })

    syncDirectory(desiredTmpPath, libDir, {
        deleteOrphaned: true,
    })
}

main()
