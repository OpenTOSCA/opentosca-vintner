import * as assert from '#assert'
import * as check from '#check'
import Enricher from '#enricher'
import * as files from '#files'
import {ServiceTemplate} from '#spec/service-template'

export type TemplateResolveOptions = {
    template: string
    presets?: string[]
    inputs?: string
    output: string
}

export default async function (options: TemplateResolveOptions) {
    assert.isDefined(options.template, 'Template not defined')
    if (check.isUndefined(options.output)) throw new Error(`Output not defined`)
    const template = files.loadYAML<ServiceTemplate>(options.template)
    const result = await Enricher.enrich({template})
    files.storeYAML(options.output, result.template)
}
