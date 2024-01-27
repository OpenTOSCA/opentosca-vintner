import * as assert from '#assert'
import Enricher from '#enricher'
import * as files from '#files'
import {ServiceTemplate} from '#spec/service-template'

export type TemplateEnrichOptions = {
    template: string
    presets?: string[]
    inputs?: string
    output: string
}

export default async function (options: TemplateEnrichOptions) {
    assert.isDefined(options.template, 'Template not defined')
    assert.isDefined(options.output, 'Output not defined')
    const template = files.loadYAML<ServiceTemplate>(options.template)
    await new Enricher(template).run()
    files.storeYAML(options.output, template)
}
