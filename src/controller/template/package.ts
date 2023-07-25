import * as assert from '#assert'
import * as check from '#check'
import * as files from '#files'

export type TemplatePackageOptions = {
    template: string
    output: string
}

export default async function (options: TemplatePackageOptions) {
    assert.isDefined(options.template, 'Template not defined')
    if (check.isUndefined(options.output)) throw new Error(`Output not defined`)
    await files.createArchive(options.template, options.output)
}
