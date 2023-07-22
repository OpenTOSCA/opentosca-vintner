import * as files from '#files'
import * as validator from '#validator'
import path from 'path'

export type TemplateInitOptions = {
    name?: string
    vintner?: string
    template: string
    force?: boolean
}

export default async function (options: TemplateInitOptions) {
    if (validator.isUndefined(options.template)) throw new Error(`Template not defined`)
    files.createDirectory(options.template)

    options.force = options.force ?? false
    validator.ensureBoolean(options.force)
    if (!options.force) files.assertEmpty(options.template)

    // TODO: get default name by path
    // TODO: mv name template and mv template path
    options.name = options.name ?? 'TODO'
    options.vintner = options.vintner ?? 'yarn cli'

    await files.sync(path.join(files.TEMPLATES_DIR, 'template-init'), options.template)
    await files.storeENV(path.join(options.template, 'scripts', 'configuration'), {
        TEMPLATE_NAME: options.name,
        VINTNER: options.vintner,
    })
}
