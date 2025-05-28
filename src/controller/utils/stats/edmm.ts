import * as assert from '#assert'
import Controller from '#controller'

export type UtilsStatsEDMMOptions = {
    template: string
    experimental: boolean
}

type EDMMStats = {
    models: number
    elements: number
    inputs: number
    components: number
    properties: number
    conditions: number
    relations: number
    loc: number
}

export default async function (options: UtilsStatsEDMMOptions) {
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
    const stats: EDMMStats = {
        models: 1,
        elements: vdmmStats.edmm_elements,
        inputs: vdmmStats.inputs,
        components: vdmmStats.nodes,
        properties: vdmmStats.properties,
        conditions: vdmmStats.edmm_elements_conditions_manual,
        relations: vdmmStats.relations,
        loc: vdmmStats.locp,
    }

    /**
     * Result
     */
    return stats
}
