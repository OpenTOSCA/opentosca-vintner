import { exec } from "child_process"
import { escapeRegExp } from "lodash"
import { DependencyInfo } from "./types"

const fs = require('fs')

const LIB_DIRECTORY = ".lib"
const DEPENDENCY_FILE = "dependencies.json"

function main() {
    const reloadAll = process.argv[2] == "-r"
  
    console.log("Package Manager: Install")

    createLibDirectory()

    let dependencies = JSON.parse(readDependencyFile()).dependencies
    Object.keys(dependencies).forEach(packageName => {
        let packageInfo = dependencies[packageName]        

        if(reloadAll) {
            exec(`rm -rf ${LIB_DIRECTORY}/*`)
        }

        if(!checkDirectoryExists(getDependencyDirectory(packageInfo.directory)))
            downloadDependency(packageName, packageInfo)
    })
    
}

function checkDirectoryExists(dir: string): boolean {
    return fs.existsSync(dir)
}

// Check if "./lib" exists and create if not
function createLibDirectory(): void {
    if(!checkDirectoryExists(LIB_DIRECTORY)) {
        console.log("Creating lib directory");        
        fs.mkdirSync(LIB_DIRECTORY)
    }
}

function readDependencyFile() {
    return fs.readFileSync(DEPENDENCY_FILE)
}

function downloadDependency(name: string, info: DependencyInfo): void {
    console.log(`Downloading ${info.directory}...`);
    
    let dir = domainToUrl(info.directory)
    let url = info.url + "/branches/" + info.branch + "/" + dir
    
    let libDir = getDependencyDirectory(info.directory)
    
    let command = "svn export " + url + " " + libDir
    exec(command);
}

function getDependencyDirectory(dependency: string): string {
    return LIB_DIRECTORY + "/" + dependency
}

function domainToUrl(dir: string): string {
    return dir.replace(new RegExp(escapeRegExp("."), 'g'), "/")
}

main()