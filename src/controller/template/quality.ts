import Graph from '#graph/graph'
import Loader from '#graph/loader'
import * as Resolver from '#resolver'
import * as assert from '#utils/assert'
import * as check from '#utils/check'
import path from 'path'

export type TemplateQualityOptions = {
    template: string
    dir?: string
    presets?: string[]
    inputs?: string
    experimental: boolean
}

export type TemplateQualityResult = TemplateQuality[]

export type TemplateQuality = {
    quality: number
    count: number
    normalized: number
}

// TODO: this is so dirty
export default async function (options: TemplateQualityOptions): Promise<TemplateQualityResult> {
    assert.isDefined(options.template, 'Template not defined')
    assert.isTrue(options.experimental)

    if (check.isDefined(options.presets) || check.isDefined(options.inputs)) {
        // TODO: this makes only randomized or non unique results sense?
        const results = await Resolver.optimize({
            template: options.template,
            inputs: options.inputs,
            presets: options.presets,
        })

        /**
         * TODO: checker does not run on these results!
         * should resolve it twice: once for best and once for worst
         *
         * but due to topology optimization and uniqueness we can assume that nodes at fixed and therefore their technologies?
         *
         */

        if (results.length === 0) return []

        if (results.length === 1) return [results[0].quality]

        return [results[0].quality, results[results.length - 1].quality]
    }

    // TODO: should the graph detect technology in types? and then utilize Resolver.optimize

    const template = await new Loader(options.template, options.dir ? path.resolve(options.dir) : undefined).load()
    const graph = new Graph(template)

    const map = graph.serviceTemplate.topology_template?.variability?.technology_assignment_rules
    if (check.isUndefined(map)) return [{quality: 0, count: 0, normalized: 0}]
    assert.isObject(map, 'Rules not loaded')

    let weight = 0
    let count = 0

    for (const node of graph.nodes) {
        const type = node.getType()

        for (const [technology, rules] of Object.entries(map)) {
            for (const rule of rules) {
                // TODO: fix this
                assert.isDefined(rule.assign)

                // TODO: why can this be undefined?!
                assert.isDefined(rule.weight)

                // TODO: check if there are collisions?

                if (rule.assign === type.name) {
                    console.log({
                        node: node.name,
                        type: type.name,
                        weight: rule.weight,
                    })
                    weight += rule.weight
                    count++
                }
            }
        }
    }

    if (count === 0) return [{quality: weight, count, normalized: 0}]
    return [{quality: weight, count, normalized: weight / count}]
}
