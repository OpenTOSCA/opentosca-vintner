import * as files from '#files'
import * as validator from '#validator'
import Resolver from '#resolver/resolver'
import {ServiceTemplate} from '#spec/service-template'

export type TemplateResolveOptions = {
    template: string
    presets?: string[]
    inputs?: string
    output: string
}

export default async function (options: TemplateResolveOptions) {
    if (validator.isUndefined(options.template)) throw new Error(`Template not defined`)
    if (validator.isUndefined(options.output)) throw new Error(`Output not defined`)
    const inputs = await Resolver.loadInputs(options.inputs)
    const template = files.loadYAML<ServiceTemplate>(options.template)
    const result = await Resolver.resolve({template, inputs, presets: options.presets})
    files.storeYAML(options.output, result.template)
}
