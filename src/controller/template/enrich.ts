import * as assert from '#assert'
import Enricher from '#enricher'
import * as files from '#files'
import Loader from '#graph/loader'

export type TemplateEnrichOptions = {
    template: string
    presets?: string[]
    inputs?: string
    output: string
}

export default async function (options: TemplateEnrichOptions) {
    assert.isDefined(options.template, 'Template not defined')
    assert.isDefined(options.output, 'Output not defined')
    const template = await new Loader(options.template).load()
    await new Enricher(template).run()
    files.storeYAML(options.output, template)
}
