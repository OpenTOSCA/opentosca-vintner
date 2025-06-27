import * as assert from '#assert'
import * as check from '#check'
import Controller from '#controller'
import * as Stats from '#controller/stats/stats'
import Graph from '#graph/graph'
import Loader from '#graph/loader'
import {hotfixBratans} from '#resolver'

export type UtilsStatsTOSCAOptions = {
    template: string
    full?: boolean
    experimental: boolean
}

export default async function (options: UtilsStatsTOSCAOptions) {
    assert.isDefined(options.template, 'Template not defined')
    assert.isTrue(options.experimental)
    options.full = options.full ?? true

    /**
     * Graph
     */
    const loader = new Loader(options.template)
    const template = loader.raw()
    hotfixBratans(template)
    const graph = new Graph(template, {full: options.full})

    /**
     * VDMM Stats
     */
    const vdmmStats = await Controller.template.stats({
        template: [options.template],
        experimental: true,
        full: options.full,
    })

    /**
     * Stats
     */
    const stats = new Stats.Builder(Stats.ID.tosca)

    /**
     * Models
     */
    stats.files += 1

    /**
     * LOC
     */
    stats.loc += vdmmStats.locp

    /**
     * Inputs
     */
    stats.inputs = graph.inputs.map(it => it.name).filter(Stats.isNotFeature).length

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
    stats.properties = graph.properties.map(it => it.name).filter(Stats.isNotFeature).length

    /**
     * Relations
     */
    stats.relations = vdmmStats.relations

    /**
     * Artifacts
     */
    stats.artifacts = vdmmStats.artifacts

    /**
     * No Technologies (its part of the scenario encoded in the node type)
     */

    /**
     * Conditions, Mappings
     *
     * Substitution mapping is treated as graph replacement rule as follows:
     *      - left: component with node type and optional filters
     *      - glue: properties, capabilities, and requirements mapping
     *      - right: remaining elements
     *
     * Input descriptions are also treated as conditions
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

    stats.conditions += graph.inputs
        .map(it => it.name)
        .filter(Stats.isNotFeature)
        .filter(it => check.isDefined(graph.getInput(it).raw.description)).length

    /**
     * Expressions (substitution directive, feature deployment inputs as variability inputs, feature properties as variability passthrough)
     */
    stats.expressions += graph.nodes.filter(it => {
        const directives = it.raw.directives
        if (check.isDefined(directives)) {
            return directives.includes('substitute')
        }
        return false
    }).length

    stats.expressions += graph.inputs.map(it => it.name).filter(Stats.isFeature).length
    stats.expressions += graph.properties.map(it => it.name).filter(Stats.isFeature).length

    /**
     * Result
     */
    return stats.build()
}
