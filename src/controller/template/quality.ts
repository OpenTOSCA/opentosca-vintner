import * as Resolver from '#resolver'
import std from '#std'
import * as utils from '#utils'
import * as assert from '#utils/assert'

export type TemplateQualityOptions = {
    template: string
    presets?: string[]
    inputs?: string
    experimental: boolean
}

export default async function (options: TemplateQualityOptions) {
    assert.isDefined(options.template, 'Template not defined')
    assert.isTrue(options.experimental)

    /**
     * Note, checker does not run on these results!
     * However, this is fine as long as the correct resolving options, e.g., with constraints enabled
     */
    const results = await Resolver.optimize({
        template: options.template,
        inputs: options.inputs,
        presets: options.presets,
    })

    /**
     * Note, this might not be required since we assume that they are sorted by result.technologies.weight.
     * However, this only applies if correct resolving options are used.
     */
    // results.sort(it => it.quality.average)

    // TODO: remove this
    std.log(results.map(it => it.quality))

    if (results.length === 0) return []

    if (results.length === 1) return [utils.first(results).quality]

    return [utils.first(results).quality, utils.last(results).quality]
}
