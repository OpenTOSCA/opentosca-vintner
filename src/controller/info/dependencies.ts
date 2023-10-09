import * as files from '#files'
import std from '#std'
import path from 'path'

export default async function () {
    const dependencies = files.loadFile(path.join(files.ASSETS_DIR, 'dependencies.csv'))
    std.log(dependencies)
    return dependencies
}
