import * as assert from '#assert'
import * as files from '#files'

export type TemplatePackageOptions = {
    template: string
    output: string
}

export default async function (options: TemplatePackageOptions) {
    assert.isDefined(options.template, 'Template not defined')
    assert.isDefined(options.output, 'Output not defined')
    await files.createArchive(options.template, options.output)
}
