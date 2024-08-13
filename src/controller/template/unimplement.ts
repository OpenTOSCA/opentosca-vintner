import * as assert from '#assert'
import * as files from '#files'
import {GENERATION_MARK_REGEX} from '#technologies/utils'
import path from 'path'

export type TemplateImplementOptions = {
    dir: string
}

export default async function (options: TemplateImplementOptions) {
    assert.isDefined(options.dir, 'Directory not defined')

    for (const file of files.walkDirectory(path.join(options.dir, 'lib'), {extensions: ['yaml', 'yml']})) {
        const templateString = files.loadFile(file)
        if (!GENERATION_MARK_REGEX.test(templateString)) continue
        files.storeFile(file, templateString.replace(GENERATION_MARK_REGEX, '').trimEnd() + '\n')
    }
}
