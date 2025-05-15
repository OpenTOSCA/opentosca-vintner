import * as assert from '#assert'
import * as files from '#files'
import {YAML_EXTENSIONS} from '#files'
import {NormativeTypes} from '#normative'
import std from '#std'
import {GENERATION_MARK_REGEX, QUALITIES_FILENAME} from '#technologies/utils'
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

    const normative = NormativeTypes()

    files.removeFile(path.join(lib, normative.profile.yaml))
    files.removeFile(path.join(lib, normative.core.yaml))
    files.removeFile(path.join(lib, normative.extended.yaml))
    files.removeFile(path.join(lib, QUALITIES_FILENAME))

    for (const file of files.walkDirectory(lib, {extensions: YAML_EXTENSIONS})) {
        const templateString = files.loadFile(file)
        if (!GENERATION_MARK_REGEX.test(templateString)) continue
        files.storeFile(file, templateString.replace(GENERATION_MARK_REGEX, '').trimEnd() + '\n')
    }

    std.out('Service template "lib/types.yaml" requires manual cleanup')
}
