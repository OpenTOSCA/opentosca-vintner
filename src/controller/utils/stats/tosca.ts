import * as assert from '#assert'
import * as check from '#check'
import Controller from '#controller'
import Graph from '#graph/graph'
import Loader from '#graph/loader'

export type UtilsStatsTOSCAOptions = {
    template: string
    experimental: boolean
}

type TOSCAStats = {
    models: number
    elements: number
    inputs: number
    outputs: number
    components: number
    properties: number
    variability: number
    relations: number
    loc: number
}

// TODO: elements count is not correct? technology?

export default async function (options: UtilsStatsTOSCAOptions) {
    assert.isDefined(options.template, 'Template not defined')
    assert.isTrue(options.experimental)

    /**
     * Graph
     */
    const loader = new Loader(options.template)
    const template = await loader.load()
    const graph = new Graph(template)

    /**
     * VDMM Stats
     */
    const vdmmStats = await Controller.template.stats({
        template: [options.template],
        experimental: true,
    })

    /**
     * Stats
     */
    const stats: TOSCAStats = {
        models: 1,
        elements: vdmmStats.edmm_elements,
        inputs: vdmmStats.inputs,
        outputs: vdmmStats.outputs,
        components: vdmmStats.nodes,
        properties: vdmmStats.properties,
        variability: 0,
        relations: vdmmStats.relations,
        loc: vdmmStats.locp,
    }

    /**
     * Substitution Mapping (treated as left graph, mappings is glue graph and treated as variability)
     */
    const substitution = template.topology_template?.substitution_mappings
    if (check.isDefined(substitution)) {
        stats.components++
        stats.elements++
        stats.variability += (substitution.substitution_filter?.properties ?? []).length
        stats.variability += Object.keys(substitution.properties ?? {}).length
        stats.variability += Object.keys(substitution.capabilities ?? {}).length
        stats.variability += Object.keys(substitution.requirements ?? {}).length
    }

    /**
     * Substitution Directive
     */
    stats.variability += graph.nodes.filter(it => {
        const directives = it.raw.directives
        if (check.isDefined(directives)) {
            return directives.includes('substitute')
        }
        return false
    }).length

    /**
     * Result
     */
    return stats
}
