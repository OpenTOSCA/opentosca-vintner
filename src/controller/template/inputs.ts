import Resolver from '#resolver'
import * as validator from '#validator'

export type TemplateInputsOptions = {
    path: string
}

export default async function (options: TemplateInputsOptions) {
    validator.ensureDefined(options.path, 'Inputs not defined')
    return await Resolver.loadInputs(options.path)
}
