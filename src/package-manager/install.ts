import {exec} from 'child_process'
import { DEPENDENCY_FILE } from './consts'
import {DependencyInfo, DependencyFile} from './types'
import * as utils from './utils'

function main() {
    utils.createLibDirectory()

    if(utils.checkDirectoryOrFileExists(DEPENDENCY_FILE) == false) {
        console.log("No dependencies.json found");
        return
    }
    
    const dependencies = utils.readDependencyFile().dependencies

    if(process.argv.length == 2) {
        installFromDependencyFile()
        return
    }
    else if(process.argv.length < 5) {
        console.log('Missing arguments\n\n\tpackage:install package-name git-url branch\n');
        return
    }
    
    let packageName = process.argv[2]
    let packageUrl = process.argv[3]
    let packageBranch = process.argv[4]    

    // Check if package is already installed
    if(dependencies[packageName] != null) {
        console.log(`Package  ${packageName}  is already installed`);        
        return
    }

    // Create new object
    let newDependency: DependencyInfo = {
        url: packageUrl,
        branch: packageBranch
    }
    dependencies[packageName] = newDependency

    // Save new dependency file
    utils.writeDependencyFile(dependencies)

    // Install new dependency
    installDependency(packageName, dependencies[packageName])
}

/**
 * Install a single dependency
 */
function installDependency(name: string, info: DependencyInfo): void {
    let fullDir = utils.getFullDependencyDirectory(name)
    let dirExists = utils.checkDirectoryOrFileExists(fullDir)
        
    if (!dirExists) {
        downloadDependency(name, info)
    }
}

/**
 * Install all dependencies from dependency file
 */
function installFromDependencyFile(): void {
    console.log("Installing all packages from dependency file");    

    const dependencies = utils.readDependencyFile().dependencies
    
    Object.keys(dependencies).forEach(packageName => {
        const packageInfo = dependencies[packageName]  

        installDependency(packageName, packageInfo)
    })
}

function downloadDependency(name: string, info: DependencyInfo): void {
    console.log(`Installing ${name}`)

    const dir = utils.domainToUrl(name)
    const url = info.url + '/branches/' + info.branch + '/' + dir

    const libDir = utils.getFullDependencyDirectory(name)

    const command = `svn export ${url} ${libDir}`
    exec(command)

    /**
     * alternative? https://www.npmjs.com/package/github-download-directory
     */
}

main()
