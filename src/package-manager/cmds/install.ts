import * as files from '../../utils/files'
import {DEPENDENCY_FILE, readDependencies} from '../utils'

export default async function () {
    console.log('Installing dependencies')
    if (!files.exists(DEPENDENCY_FILE)) return console.log('Dependencies file not found')

    return Promise.all(
        readDependencies().map(dependency => {
            return dependency.install
        })
    )
}
