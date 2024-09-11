import {load} from '#resolver'
import Resolver from '#resolver/resolver'
import * as utils from '#utils'
import * as assert from '#utils/assert'

export type TemplateQualityOptions = {
    template: string
    presets?: string[]
    inputs?: string
}

export default async function (options: TemplateQualityOptions) {
    assert.isDefined(options.template, 'Template not defined')

    /**
     * Note, checker does not run on these results!
     * However, this is fine as long as the correct resolving options are used, e.g., with constraints enabled
     */
    return {
        min_weight: await weight(options, 'min'),
        max_weight: await weight(options, 'max'),
        min_count: await count(options, 'min'),
        //max_count: await count(options, 'max'),
        max_weight_min_count: await weightCount(options),
    }
}

async function weight(options: TemplateQualityOptions, direction: 'min' | 'max') {
    const loaded = await load(utils.copy(options), {
        topology_template: {
            variability: {
                options: {
                    optimization_technologies: direction,
                    optimization_technologies_mode: 'weight',
                },
            },
        },
    })
    const optimized = new Resolver(loaded.graph, loaded.inputs).optimize()
    if (optimized.length !== 1) throw new Error(`Did not return correct quality`)
    return utils.roundNumber(utils.first(optimized).quality.average)
}

async function count(options: TemplateQualityOptions, direction: 'min' | 'max') {
    const loaded = await load(utils.copy(options), {
        topology_template: {
            variability: {
                options: {
                    optimization_technologies: direction,
                    optimization_technologies_mode: 'count',
                },
            },
        },
    })
    const all = new Resolver(loaded.graph, loaded.inputs).optimize({all: true})
    const min = Math.min(...all.map(it => it.technologies.count))
    const candidates = all
        .filter(it => it.technologies.count === min)
        .sort((a, b) => a.quality.average - b.quality.average)

    // TODO: remove this
    /*
    console.log('---------------------------------------------------------------------------------------------------')
    console.log('some counting')
    console.log('---------------------------------------------------------------------------------------------------')
    console.log(all.length)
    console.log(
        candidates.map(it => ({
            technologies: it.technologies.count_each,
            quality: it.quality.average,
            presences: it.getPresences('technology'),
        }))
    )
     */

    return {
        min: utils.roundNumber(utils.first(candidates).quality.average),
        max: utils.roundNumber(utils.last(candidates).quality.average),
    }
}

async function weightCount(options: TemplateQualityOptions) {
    const loaded = await load(utils.copy(options), {
        topology_template: {
            variability: {
                options: {
                    optimization_technologies_mode: 'weight-count',
                },
            },
        },
    })
    const optimized = new Resolver(loaded.graph, loaded.inputs).optimize()
    if (optimized.length !== 1) throw new Error(`Did not return correct quality`)
    return utils.roundNumber(utils.first(optimized).quality.average)
}
