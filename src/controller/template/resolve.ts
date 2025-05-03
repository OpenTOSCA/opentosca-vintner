import * as assert from '#assert'
import * as files from '#files'
import * as Resolver from '#resolver'

export type TemplateResolveOptions = {
    template: string
    presets?: string[]
    inputs?: string
    output: string
    enrich?: boolean
}

export default async function (options: TemplateResolveOptions) {
    assert.isDefined(options.template, 'Template not defined')
    assert.isDefined(options.output, 'Output not defined')

    const result = await Resolver.run({
        template: options.template,
        inputs: options.inputs,
        presets: options.presets,
        enrich: options.enrich ?? false,
    })

    files.storeYAML(options.output, result.template)
}
