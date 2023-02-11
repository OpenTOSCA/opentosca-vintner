import * as files from '#files'
import * as validator from '#validator'
import Resolver from '#resolver'

export type TemplateResolveOptions = {
    template: string
    presets?: string[]
    inputs?: string
    output: string
}

export default async function (options: TemplateResolveOptions) {
    if (validator.isUndefined(options.output)) throw new Error(`Output not defined`)
    const inputs = await Resolver.loadInputs(options.inputs)
    const result = await Resolver.resolve({...options, inputs})
    files.storeYAML(options.output, result.template)
}
