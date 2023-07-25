import * as check from '#check'
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
    if (check.isUndefined(options.template)) throw new Error(`Template not defined`)
    if (check.isUndefined(options.output)) throw new Error(`Output not defined`)
    const inputs = await Resolver.loadInputs(options.inputs)
    const template = files.loadYAML<ServiceTemplate>(options.template)
    const result = await Resolver.resolve({template, inputs, presets: options.presets})
    files.storeYAML(options.output, result.template)
}
