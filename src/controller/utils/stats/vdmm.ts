import * as assert from '#assert'
import Controller from '#controller'
import * as Stats from '#controller/utils/stats/stats'

export type UtilsStatsVDMMOptions = {
    template: string
    experimental: boolean
}

export default async function (options: UtilsStatsVDMMOptions) {
    assert.isDefined(options.template, 'Template not defined')
    assert.isTrue(options.experimental)

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
    const stats = new Stats.Builder('VDMM')

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
     * Technologies
     */
    stats.technologies = vdmmStats.technologies

    /**
     * Conditions
     */
    stats.conditions = vdmmStats.edmm_elements_conditions_manual

    /**
     * Expressions
     */
    stats.expressions += vdmmStats.anchors
    stats.expressions += vdmmStats.variability_inputs

    /**
     * No Mappings
     */

    /**
     * Result
     */
    return stats.build()
}
