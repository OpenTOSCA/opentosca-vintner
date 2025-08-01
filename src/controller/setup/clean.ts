import * as files from '#files'
import {Assets} from '#repositories/assets'
import {Instances} from '#repositories/instances'
import {Templates} from '#repositories/templates'
import env from '#utils/env'
import * as os from 'os'
import path from 'path'

export type SetupCleanOptions = {force: boolean}

export default async function (options: SetupCleanOptions) {
    // Ensure no templates or instances exist
    options.force = options.force ?? false
    if (!options.force) {
        if (!Templates.isEmpty()) throw new Error(`Templates not empty`)
        if (!Instances.isEmpty()) throw new Error(`Instances not empty`)
        if (!Assets.isEmpty()) throw new Error(`Assets not empty`)
    }

    // Delete home directory
    files.removeDirectory(env.home)

    // Delete tmp directories
    files
        .listFiles(os.tmpdir())
        .filter(it => it.startsWith(files.TMP_PREFIX))
        .forEach(it => files.removeFile(path.join(os.tmpdir(), it)))

    // Delete tmp files
    files
        .listDirectories(os.tmpdir())
        .filter(it => it.startsWith(files.TMP_PREFIX))
        .forEach(it => files.removeDirectory(path.join(os.tmpdir(), it)))
}
