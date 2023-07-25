import * as check from '#check'
import * as files from '#files'

export type TemplatePackageOptions = {
    template: string
    output: string
}

export default async function (options: TemplatePackageOptions) {
    if (check.isUndefined(options.template)) throw new Error(`Template not defined`)
    if (check.isUndefined(options.output)) throw new Error(`Output not defined`)
    await files.createArchive(options.template, options.output)
}
