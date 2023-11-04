import config from '#config'
import * as files from '#files'
import {Instances} from '#repository/instances'
import {Keystore} from '#repository/keystore'
import {Templates} from '#repository/templates'
import * as os from 'os'
import path from 'path'

export type SetupCleanOptions = {force: Boolean}

export default async function (options: SetupCleanOptions) {
    // Ensure no templates or instances exist
    options.force = options.force ?? false
    if (!options.force) {
        if (!Templates.isEmpty()) throw new Error(`Templates not empty`)
        if (!Instances.isEmpty()) throw new Error(`Instances not empty`)
        if (!Keystore.isEmpty()) throw new Error(`Keys not empty`)
    }

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
