import * as assert from '#assert'
import * as files from '#files'
import NormativeBaseTypes from '#normative/base'
import NormativeSpecificTypes from '#normative/specific'
import std from '#std'
import {GENERATION_MARK_REGEX, TECHNOLOGY_RULES_FILE_NAME} from '#technologies/utils'
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

    await files.removeFile(path.join(lib, NormativeBaseTypes.filename))
    await files.removeFile(path.join(lib, NormativeSpecificTypes.filename))
    await files.removeFile(path.join(lib, TECHNOLOGY_RULES_FILE_NAME))

    for (const file of files.walkDirectory(lib, {extensions: ['yaml', 'yml']})) {
        const templateString = files.loadFile(file)
        if (!GENERATION_MARK_REGEX.test(templateString)) continue
        files.storeFile(file, templateString.replace(GENERATION_MARK_REGEX, '').trimEnd() + '\n')
    }

    std.out('Service template "lib/types.yaml" requires manual cleanup')
}
