import * as assert from '#assert'
import * as files from '#files'
import Loader from '#graph/loader'
import Normalizer from '#normalizer'

export type TemplateNormalizeOptions = {
    template: string
    output: string
}

export default async function (options: TemplateNormalizeOptions) {
    assert.isDefined(options.template, 'Template not defined')
    assert.isDefined(options.output, 'Output not defined')
    const template = new Loader(options.template).raw()
    new Normalizer(template).run()
    files.storeYAML(options.output, template)
}
