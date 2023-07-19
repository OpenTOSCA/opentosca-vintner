import * as files from '#files'
import path from 'path'

export default async function () {
    console.log(files.loadFile(path.join(files.ASSETS_DIR, 'dependencies.csv')))
}
