import * as files from '#files'
import Resolver from '#resolver'
import * as validator from '#validator'

export type TemplateInputsOptions = {
    path: string
    output: string
}

export default async function (options: TemplateInputsOptions) {
    validator.ensureDefined(options.path, 'Inputs not defined')
    validator.ensureDefined(options.output, 'Output not defined')

    const inputs = await Resolver.loadInputs(options.path)
    files.storeYAML(options.output, inputs)
}
