import * as Resolver from '#resolver'
import * as assert from '#utils/assert'

export type TemplateQualityOptions = {
    template: string
    presets?: string[]
    inputs?: string
    quality?: boolean
    counting?: boolean
    random?: boolean
    experimental: boolean
}

export default async function (options: TemplateQualityOptions) {
    assert.isDefined(options.template, 'Template not defined')
    assert.isTrue(options.experimental)

    /**
     * Note, checker does not run on these results!
     * However, this is fine as long as the correct resolving options are used, e.g., with constraints enabled
     */
    return await Resolver.minMaxQuality({
        template: options.template,
        inputs: options.inputs,
        presets: options.presets,
        quality: options.quality,
        counting: options.counting,
        random: options.random,
    })
}
