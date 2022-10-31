import {DEPENDENCY_FILE, LIB_DIRECTORY, TMP_DIRECTORY} from './consts'
import * as files from '../utils/files'
import * as utils from './utils'
import path from 'path'
import list from '../controller/templates/list'
import {Dependencies} from './types'

function main() {
    const dependencyList = utils.gatherAllDependencies()
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

main()
