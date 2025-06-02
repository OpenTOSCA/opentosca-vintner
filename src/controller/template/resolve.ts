import * as assert from '#assert'
import {PERFORMANCE_RESOLVER_WRITE} from '#controller/study/performance'
import * as files from '#files'
import * as Resolver from '#resolver'
import performance from '#utils/performance'

export type TemplateResolveOptions = {
    template: string
    presets?: string[]
    inputs?: string
    output: string
    enrich?: boolean
    pretty?: boolean
    edmm?: boolean
}

export default async function (options: TemplateResolveOptions) {
    assert.isDefined(options.template, 'Template not defined')
    assert.isDefined(options.output, 'Output not defined')

    const result = await Resolver.run({
        template: options.template,
        inputs: options.inputs,
        presets: options.presets,
        enrich: options.enrich ?? false,
        edmm: options.edmm ?? false,
    })

    performance.start(PERFORMANCE_RESOLVER_WRITE)
    files.storeYAML(options.output, result.template, {pretty: options.pretty})
    performance.stop(PERFORMANCE_RESOLVER_WRITE)
}
