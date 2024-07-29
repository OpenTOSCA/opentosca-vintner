import * as Resolver from '#resolver'
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
    const {results, graph} = await Resolver.optimize({
        template: options.template,
        inputs: options.inputs,
        presets: options.presets,
    })

    /**
     * Note, this might not be required since we assume that they are sorted by result.technologies.weight.
     * However, this only applies if correct resolving options are used.
     */
    results.sort((a, b) => a.quality.average - b.quality.average)

    /**
     * Quality
     *
     * Get the result with the max quality of all results
     */
    if (graph.options.solver.technologies.optimize && graph.options.solver.technologies.mode === 'weight') {
        return utils.last(results).quality.average
    }

    /**
     * Counting
     *
     * Get the min and max quality of the results which have the min number of technologies
     */
    if (graph.options.solver.technologies.optimize && graph.options.solver.technologies.mode === 'count') {
        const min = Math.min(...results.map(it => it.technologies.count))
        const candidates = results.filter(it => it.technologies.count === min)
        return [utils.first(candidates).quality.average, utils.last(candidates).quality.average]
    }

    /**
     * Random
     *
     * Get the min and max quality of all results
     */
    return [utils.first(results).quality.average, utils.last(results).quality.average]
}
