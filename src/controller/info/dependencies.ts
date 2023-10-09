import * as files from '#files'
import std from '#std'
import path from 'path'

export default async function () {
    std.out(files.loadFile(path.join(files.ASSETS_DIR, 'dependencies.csv')))
}
