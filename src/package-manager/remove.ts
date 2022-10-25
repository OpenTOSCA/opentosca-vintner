import {exec} from 'child_process'
import {DependencyInfo, DependencyFile} from './types'
import * as utils from './utils'
import * as fs from 'fs'
import {DEPENDENCY_FILE} from './consts'

function main() {
    if (process.argv.length != 3) {
        console.log('Missing arguments\n\n\tpackage:remove package-name\n')
        return
    }
    const packageName = process.argv[2]

    // Check if dependencies.json exists
    if (utils.checkDirectoryOrFileExists(DEPENDENCY_FILE) == false) {
        console.log('No dependencies.json found')
        return
    }
    const dependencies = utils.readDependencyFile().dependencies

    // Check if package is already installed
    if (dependencies[packageName] == null) {
        console.log(`No package with name  ${packageName}  found`)
        return
    }

    delete dependencies[packageName]

    fs.rmSync(utils.getFullDependencyDirectory(packageName), {recursive: true})

    // Save new dependency file
    utils.writeDependencyFile(dependencies)

    console.log(`package  ${packageName}  removed.`)
}

main()
