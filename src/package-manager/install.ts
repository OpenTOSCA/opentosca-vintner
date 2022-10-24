import { exec } from 'child_process'
import { DependencyInfo } from './types'
import * as utils from './utils'
import * as cleanup from './cleanup'

function main() {
    const reloadAll = process.argv[2] == "-r"
  
    console.log('Package Manager: Install')

    utils.createLibDirectory()

    let dependencies = JSON.parse(utils.readDependencyFile()).dependencies
    Object.keys(dependencies).forEach(packageName => {
        let packageInfo = dependencies[packageName]        

        if(reloadAll) {
            cleanup.cleanup()
        }

        if(!utils.checkDirectoryExists(utils.getFullDependencyDirectory(packageInfo.directory)))
            downloadDependency(packageName, packageInfo)
    })
    
}

function downloadDependency(name: string, info: DependencyInfo): void {
    console.log(`Downloading ${info.directory}...`);
    
    let dir = utils.domainToUrl(info.directory)
    let url = info.url + '/branches/' + info.branch + '/' + dir
    
    let libDir = utils.getFullDependencyDirectory(info.directory)
    
    let command = `svn export ${url} ${libDir}`
    exec(command);

    /**
     * alternative? https://www.npmjs.com/package/github-download-directory
     */
}

main()