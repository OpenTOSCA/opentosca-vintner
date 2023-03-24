import * as files from '#files'
import * as validator from '#validator'

export type TemplatePackageOptions = {
    template: string
    output: string
}

export default async function (options: TemplatePackageOptions) {
    if (validator.isUndefined(options.template)) throw new Error(`Template not defined`)
    if (validator.isUndefined(options.output)) throw new Error(`Output not defined`)
    await files.createArchive(options.template, options.output)
}
