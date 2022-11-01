import * as files from '../utils/files'
import * as utils from './utils'
import path from 'path'
import {Shell} from '../utils/shell'
import {Dependencies, Dependency} from './dependency'

export default async function () {
    console.log('Installing dependencies')

    if (!files.exists(utils.DEPENDENCY_FILE)) return console.log('Dependencies file not found')

    files.createDirectory(utils.LIB_DIRECTORY)
    files.createDirectory(utils.TMP_DIRECTORY)

    await installDependencies(utils.readDependencies())
}

/**
 * Install a single dependency
 */
async function installDependency(dependency: Dependency) {
    const shell = new Shell()

    if (files.exists(dependency.clone)) {
        // Repo has already been cloned
        console.log(`Updating ${dependency.id}`)
        await shell.execute(['git', '-C', dependency.clone, 'pull'])
    } else {
        // TODO tag/commit
        console.log(`Installing ${dependency.id}`)
        await shell.execute(['git', 'clone', '--branch', dependency.checkout, dependency.repo, dependency.clone])
        //execSync(`git checkout ${dependency.checkout}`) ???
    }
    await dependency.sync()

    const recursiveDependencyFile = path.join(dependency.target, utils.DEPENDENCY_FILE)
    if (files.exists(recursiveDependencyFile)) {
        await installDependencies(utils.readDependencies(recursiveDependencyFile))
    }
}

/**
 * Install multiple dependencies
 */
async function installDependencies(dependencies: Dependencies) {
    return Promise.all(
        dependencies.map(dependency => {
            return installDependency(dependency)
        })
    )
}
