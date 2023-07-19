import * as files from '#files'
import * as validator from '#validator'

export type TemplateInitOptions = {
    template: string
}

export default async function (options: TemplateInitOptions) {
    if (validator.isUndefined(options.template)) throw new Error(`Template not defined`)
    files.assertDirectory(options.template)
    files.assertEmpty(options.template)

    // TODO: init template
}
