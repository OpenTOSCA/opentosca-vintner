import * as assert from '#assert'
import {calculateStats} from '#controller/template/stats'
import {Stats} from '#controller/utils/stats/utils'
import * as files from '#files'
import {ServiceTemplate} from '#spec/service-template'

export type UtilsStatsEJSOptions = {
    template: string
    experimental: boolean
}

export default async function (options: UtilsStatsEJSOptions) {
    assert.isDefined(options.template, 'Template not defined')
    assert.isTrue(options.experimental)

    /**
     * EJS
     */
    const ejs = files.loadFile(options.template)

    /**
     * VDMM Stats
     */
    const vdmmStats = calculateStats(asServiceTemplate(ejs), options.template, {full: false})

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
    stats.loc = files.countNotBlankLines(options.template)

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
     * Conditions
     */
    stats.conditions += countIfs(ejs)
    stats.conditions += countElses(ejs)
    stats.conditions += countTernaries(ejs)

    /**
     * No Expressions
     */

    /**
     * No Mappings
     */

    /**
     * Result
     */
    return stats.propagate()
}

function asServiceTemplate(raw: string): ServiceTemplate {
    const data = raw.replace(/<%=.*%>/g, 'DUMMY').replace(/<%.*%>/g, '')
    return files.parseYAML<ServiceTemplate>(data)
}

function countTernaries(ejs: string) {
    return (ejs.match(/<%=.*?.*:.*%>/g) ?? []).length * 2
}

// TODO: multiply by effected elements?
function countIfs(ejs: string) {
    return (ejs.match(/<% if /g) ?? []).length
}

// TODO: multiply by effected elements?
function countElses(ejs: string) {
    return (ejs.match(/<% } else { %>/g) ?? []).length
}
