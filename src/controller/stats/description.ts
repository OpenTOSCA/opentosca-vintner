import * as assert from '#assert'
import * as check from '#check'
import * as Stats from '#controller/stats/stats'
import * as files from '#files'
import * as utils from '#utils'

export type UtilsStatsDescriptionOptions = {
    template: string
    id: string
    experimental: boolean
}

export default async function (options: UtilsStatsDescriptionOptions) {
    assert.isDefined(options.template, 'Template not defined')
    assert.isDefined(options.id, 'ID not defined')
    assert.isTrue(options.experimental)

    /**
     * Stats
     */
    const stats = new Stats.Builder(options.id)

    /**
     * Models
     */
    const description = files.loadYAML<Description>(options.template)
    stats.files += 1

    /**
     * LOC
     */
    stats.loc += files.countNotBlankLines(options.template)

    /**
     * Inputs
     */
    stats.inputs += utils.sum(description.map(it => Object.keys(it.inputs).filter(Stats.isNotFeature).length))

    /**
     * No Outputs
     */

    /**
     * No Components
     */

    /**
     * No Properties
     */

    /**
     * No Relations
     */

    /**
     * No Artifacts
     */

    /**
     * No Technologies
     */

    /**
     * Conditions
     */
    stats.conditions += description.filter(it => check.isDefined(it.when)).length

    /**
     * Expressions
     */
    stats.expressions += utils.sum(description.map(it => Object.keys(it.inputs).filter(Stats.isFeature).length))

    /**
     * No Mappings
     */

    /**
     * Result
     */
    return stats.build()
}

type Description = {
    when?: string
    inputs: {[key: string]: any}
}[]
