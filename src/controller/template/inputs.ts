import * as assert from '#assert'
import * as files from '#files'
import Inputs from '#resolver/inputs'

export type TemplateInputsOptions = {
    path: string
    output: string
}

export default async function (options: TemplateInputsOptions) {
    assert.isDefined(options.path, 'Inputs not defined')
    assert.isDefined(options.output, 'Output not defined')

    const inputs = await new Inputs().loadInputs(options.path)
    files.storeYAML(options.output, inputs)
}
