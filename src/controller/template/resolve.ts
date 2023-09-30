import * as assert from '#assert'
import * as files from '#files'
import Resolver from '#resolver'
import {ServiceTemplate} from '#spec/service-template'

export type TemplateResolveOptions = {
    template: string
    presets?: string[]
    inputs?: string
    output: string
}

export default async function (options: TemplateResolveOptions) {
    assert.isDefined(options.template, 'Template not defined')
    assert.isDefined(options.output, 'Output not defined')
    const inputs = await Resolver.loadInputs(options.inputs)
    const presets = Resolver.loadPresets(options.presets)
    const template = files.loadYAML<ServiceTemplate>(options.template)
    const result = await Resolver.resolve({template, inputs, presets})
    files.storeYAML(options.output, result.template)
}
