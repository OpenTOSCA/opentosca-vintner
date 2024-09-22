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

    const result = utils.first(optimized)

    return result.technologies
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
    const minCountGroups = Math.min(...all.map(it => it.technologies.count_groups))
    const candidates = all
        .filter(it => it.technologies.count_groups === minCountGroups)
        .sort((a, b) => a.technologies.weight_average - b.technologies.weight_average)

    const min = utils.first(candidates)
    const max = utils.last(candidates)

    return {
        min_quality: min.technologies,
        max_quality: max.technologies,
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

    const result = utils.first(optimized)

    return result.technologies
}
