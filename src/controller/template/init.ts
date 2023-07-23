import * as files from '#files'
import * as validator from '#validator'
import path from 'path'

export type TemplateInitOptions = {
    template?: string
    vintner?: string
    path: string
    force?: boolean
}

export default async function (options: TemplateInitOptions) {
    if (validator.isUndefined(options.path)) throw new Error(`Template not defined`)
    files.createDirectory(options.path)

    options.force = options.force ?? false
    validator.ensureBoolean(options.force)
    if (!options.force) files.assertEmpty(options.path)

    options.template = options.template ?? files.getName(options.path)
    validator.ensureName(options.template)

    options.vintner = options.vintner ?? 'yarn cli'

    await files.sync(path.join(files.TEMPLATES_DIR, 'template-init'), options.path)
    await files.storeENV(path.join(options.path, 'scripts', 'configuration.env'), {
        TEMPLATE_NAME: options.template,
        VINTNER: options.vintner,
    })
}
