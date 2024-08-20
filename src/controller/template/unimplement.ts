import * as assert from '#assert'
import * as files from '#files'
import std from '#std'
import {GENERATION_MARK_REGEX} from '#technologies/utils'
import path from 'path'

export type TemplateUnimplementOptions = {
    dir: string
}

export default async function (options: TemplateUnimplementOptions) {
    /**
     * Lib
     */
    assert.isDefined(options.dir, 'Directory not defined')
    const lib = path.join(options.dir, 'lib')

    await files.removeFile(path.join(lib, 'base.yaml'))
    await files.removeFile(path.join(lib, 'extended.yaml'))
    await files.removeFile(path.join(lib, 'rules.yaml'))

    for (const file of files.walkDirectory(lib, {extensions: ['yaml', 'yml']})) {
        const templateString = files.loadFile(file)
        if (!GENERATION_MARK_REGEX.test(templateString)) continue
        files.storeFile(file, templateString.replace(GENERATION_MARK_REGEX, '').trimEnd() + '\n')
    }

    std.out('Service template "lib/types.yaml" requires manual cleanup')
}
