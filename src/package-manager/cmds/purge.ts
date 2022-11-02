import * as files from '../../utils/files'
import path from 'path'
import {LIB_DIRECTORY, readAllDependencies, TMP_DIRECTORY} from '../utils'

export default async function () {
    console.log('Purging dependencies')

    const dependencies = readAllDependencies()
    console.log(dependencies)

    const directories = files.readDirectory(LIB_DIRECTORY)
    for (const dir of directories) {
        if (!dependencies.has(dir)) {
            files.removeDirectory(path.join(LIB_DIRECTORY, dir))
            files.removeDirectory(path.join(TMP_DIRECTORY, dir))
            console.log(`Purged ${dir}`)
        }
    }
}
