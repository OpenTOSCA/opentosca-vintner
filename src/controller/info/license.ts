import * as files from '#files'
import path from 'path'

export default async function () {
    return files.loadFile(path.join(files.ASSETS_DIR, 'LICENSE'))
}
