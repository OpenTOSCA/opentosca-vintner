import * as assert from '#assert'
import * as files from '#files'
import Normalizer from '#normalizer'
import {ServiceTemplate} from '#spec/service-template'

export type TemplateNormalizeOptions = {
    template: string
    presets?: string[]
    inputs?: string
    output: string
}

export default async function (options: TemplateNormalizeOptions) {
    assert.isDefined(options.template, 'Template not defined')
    assert.isDefined(options.output, 'Output not defined')
    const template = files.loadYAML<ServiceTemplate>(options.template)
    new Normalizer(template).run()
    files.storeYAML(options.output, template)
}
