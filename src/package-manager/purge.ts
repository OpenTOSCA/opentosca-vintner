import * as files from '../utils/files'
import * as utils from './utils'
import path from 'path'

export default async function () {
    console.log('Purging dependencies')

    const dependencies = utils.readAllDependencies()
    console.log(dependencies)

    const directories = files.readDirectory(utils.LIB_DIRECTORY)
    for (const dir of directories) {
        if (!dependencies.has(dir)) {
            files.removeDirectory(path.join(utils.LIB_DIRECTORY, dir))
            files.removeDirectory(path.join(utils.TMP_DIRECTORY, dir))
            console.log(`Purged ${dir}`)
        }
    }
}
