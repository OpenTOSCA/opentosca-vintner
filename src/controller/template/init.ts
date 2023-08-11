import * as assert from '#assert'
import * as check from '#check'
import * as files from '#files'
import path from 'path'

export type TemplateInitOptions = {
    template?: string
    vintner?: string
    path: string
    force?: boolean
}

export default async function (options: TemplateInitOptions) {
    if (check.isUndefined(options.path)) throw new Error(`Template not defined`)
    files.createDirectory(options.path)

    options.force = options.force ?? false
    assert.isBoolean(options.force)
    if (!options.force) files.assertEmpty(options.path)

    options.template = options.template ?? files.getName(options.path)
    assert.isName(options.template)

    options.vintner = options.vintner ?? 'yarn cli'

    files.copy(path.join(files.TEMPLATES_DIR, 'template-init'), options.path)
    files.storeENV(path.join(options.path, 'scripts', 'configuration.env'), {
        TEMPLATE_NAME: options.template,
        VINTNER: options.vintner,
    })
}
