import * as files from '#files'
import * as validator from '#validator'
import path from 'path'

export type TemplateInitOptions = {
    template: string
    force?: boolean
}

export default async function (options: TemplateInitOptions) {
    if (validator.isUndefined(options.template)) throw new Error(`Template not defined`)
    files.createDirectory(options.template)

    options.force = options.force ?? false
    validator.ensureBoolean(options.force)
    if (!options.force) files.assertEmpty(options.template)

    // TODO: scripts (which binary?!)

    await files.sync(path.join(files.TEMPLATES_DIR, 'template-init'), options.template)
}
