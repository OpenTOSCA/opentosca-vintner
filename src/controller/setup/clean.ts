import config from '#config'
import * as files from '#files'
import * as os from 'os'
import path from 'path'

export default async function () {
    // Delete home directory
    files.deleteDirectory(config.home)

    // Delete tmp directories
    files
        .listFiles(os.tmpdir())
        .filter(it => it.startsWith(files.TMP_PREFIX))
        .forEach(it => files.deleteFile(path.join(os.tmpdir(), it)))

    // Delete tmp files
    files
        .listDirectories(os.tmpdir())
        .filter(it => it.startsWith(files.TMP_PREFIX))
        .forEach(it => files.deleteDirectory(path.join(os.tmpdir(), it)))
}
