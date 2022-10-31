import {LIB_DIRECTORY, TMP_DIRECTORY} from './consts'
import * as files from '../utils/files'
import * as utils from './utils'
import path from 'path'

const dependencies = utils.readDependencyFile()

function main() {
    const directories = files.readDir(LIB_DIRECTORY)
    for (const dir of directories) {
        if (packageInList(dir) == false) {
            files.removeDirectory(path.join(LIB_DIRECTORY, dir))
            files.removeDirectory(path.join(TMP_DIRECTORY, dir))
            console.log(`Deleted ${dir}`)
        }
    }
}

function packageInList(dir: string): boolean {
    for (const dep of dependencies) {
        if (utils.getDirectoryNameForDependency(dep) == dir) {
            return true
        }
    }
    return false
}

main()
