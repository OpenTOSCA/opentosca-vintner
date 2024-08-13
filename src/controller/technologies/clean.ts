import * as assert from '#assert'
import {GENERATION_MARK_REGEX} from '#controller/technologies/utils'
import * as files from '#files'

export type TypesGenerateOptions = {lib: string}

export default async function (options: TypesGenerateOptions) {
    assert.isDefined(options.lib)

    for (const file of files.walkDirectory(options.lib)) {
        if (!file.endsWith('.yaml') && !file.endsWith('.yml')) continue
        const templateString = files.loadFile(file)
        if (!GENERATION_MARK_REGEX.test(templateString)) continue
        files.storeFile(file, templateString.replace(GENERATION_MARK_REGEX, '').trimEnd() + '\n')
    }
}
