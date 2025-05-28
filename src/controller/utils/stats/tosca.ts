import * as assert from '#assert'
import * as check from '#check'
import Controller from '#controller'
import {Stats} from '#controller/utils/stats/utils'
import Graph from '#graph/graph'
import Loader from '#graph/loader'

export type UtilsStatsTOSCAOptions = {
    template: string
    experimental: boolean
}

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
    const stats = new Stats()

    /**
     * Models
     */
    stats.models = 1

    /**
     * LOC
     */
    stats.loc = vdmmStats.locp

    /**
     * Inputs
     */
    stats.inputs = vdmmStats.inputs

    /**
     * Outputs
     */
    stats.outputs = vdmmStats.outputs

    /**
     * Components
     */
    stats.components = vdmmStats.nodes

    /**
     * Properties
     */
    stats.properties = vdmmStats.properties

    /**
     * Relations
     */
    stats.relations = vdmmStats.relations

    /**
     * Artifacts
     */
    stats.artifacts = vdmmStats.artifacts

    /**
     * Conditions, Mappings
     *
     * Substitution mapping is treated as graph replacement rule as follows:
     *      - left: component with node type and optional filters
     *      - glue: properties, capabilities, and requirements mapping
     *      - right: remaining elements
     */
    const substitution = template.topology_template?.substitution_mappings
    if (check.isDefined(substitution)) {
        // Left
        stats.components++
        stats.conditions += (substitution.substitution_filter?.properties ?? []).length

        // Glue
        stats.mappings += Object.keys(substitution.properties ?? {}).length
        stats.mappings += Object.keys(substitution.capabilities ?? {}).length
        stats.mappings += Object.keys(substitution.requirements ?? {}).length

        // Right already covered by VDMMStats
    }

    /**
     * Expressions (substitution directive)
     */
    stats.expressions += graph.nodes.filter(it => {
        const directives = it.raw.directives
        if (check.isDefined(directives)) {
            return directives.includes('substitute')
        }
        return false
    }).length

    /**
     * Result
     */
    return stats.propagate()
}
