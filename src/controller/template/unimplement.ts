import {NormativeTypes} from '#/normative'
import * as assert from '#assert'
import * as files from '#files'
import {YAML_EXTENSIONS} from '#files'
import std from '#std'
import {GENERATION_MARK_REGEX, TECHNOLOGY_RULES_FILENAME} from '#technologies/utils'
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

    await files.removeFile(path.join(lib, normative.core.yaml))
    await files.removeFile(path.join(lib, normative.extended.yaml))
    await files.removeFile(path.join(lib, TECHNOLOGY_RULES_FILENAME))

    for (const file of files.walkDirectory(lib, {extensions: YAML_EXTENSIONS})) {
        const templateString = files.loadFile(file)
        if (!GENERATION_MARK_REGEX.test(templateString)) continue
        files.storeFile(file, templateString.replace(GENERATION_MARK_REGEX, '').trimEnd() + '\n')
    }

    std.out('Service template "lib/types.yaml" requires manual cleanup')
}
