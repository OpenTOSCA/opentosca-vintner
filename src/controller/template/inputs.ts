import * as assert from '#assert'
import * as files from '#files'
import Resolver from '#resolver'

export type TemplateInputsOptions = {
    path: string
    output: string
}

export default async function (options: TemplateInputsOptions) {
    assert.isDefined(options.path, 'Inputs not defined')
    assert.isDefined(options.output, 'Output not defined')

    const inputs = await Resolver.loadInputs(options.path)
    files.storeYAML(options.output, inputs)
}
