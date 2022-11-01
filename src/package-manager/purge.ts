import {LIB_DIRECTORY, TMP_DIRECTORY} from './types'
import * as files from '../utils/files'
import * as utils from './utils'
import path from 'path'

export default async function () {
    const dependencyList = utils.gatherAllDependencies()
    console.log(dependencyList)

    const directories = files.readDirectory(LIB_DIRECTORY)
    for (const dir of directories) {
        if (!dependencyList.has(dir)) {
            files.removeDirectory(path.join(LIB_DIRECTORY, dir))
            files.removeDirectory(path.join(TMP_DIRECTORY, dir))
            console.log(`Deleted ${dir}`)
        }
    }
}
