import * as assert from '#assert'
import Controller from '#controller'
import * as Stats from '#controller/stats/stats'
import {calculateStats} from '#controller/template/stats'
import * as files from '#files'
import {ServiceTemplate} from '#spec/service-template'
import path from 'path'

export type UtilsStatsEJSOptions = {
    dir: string
    experimental: boolean
}

export default async function (options: UtilsStatsEJSOptions) {
    assert.isDefined(options.dir, 'Directory not defined')
    assert.isTrue(options.experimental)

    /**
     * Stats
     */
    const stats = new Stats.Builder('EJS')

    /**
     * Models, LOC
     */
    const ejsFile = path.join(options.dir, 'model.ejs')
    const ejs = files.loadFile(ejsFile)
    stats.files += 1
    stats.loc = +files.countNotBlankLines(ejsFile)

    /**
     * VDMM Stats
     */
    const template = asServiceTemplate(ejs)
    const vdmmStats = calculateStats(template, template, ejsFile, {full: false})

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
    stats.conditions += countIfs(ejs)
    stats.conditions += countElses(ejs)
    stats.conditions += countTernaries(ejs)

    /**
     * Expressions
     */
    stats.expressions += countReferences(ejs)

    /**
     * No Mappings
     */

    /**
     * Description
     */
    let descriptionStats: Stats.Stats | undefined
    const descriptionFile = path.join(options.dir, 'description.yaml')
    if (files.exists(descriptionFile)) {
        descriptionStats = await Controller.stats.description({
            template: path.join(options.dir, 'description.yaml'),
            id: 'Ansible',
            experimental: true,
        })
    }

    /**
     * Result
     */
    return descriptionStats ? Stats.sum([stats.build(), descriptionStats]) : stats.build()
}

function asServiceTemplate(raw: string): ServiceTemplate {
    const data = raw
        .replace(/<%=.*%>/g, 'DUMMY')
        .replace(/<%.*%>/g, '')
        .replace(/<%.*tosca_definitions_version/gs, 'tosca_definitions_version')
    return files.parseYAML<ServiceTemplate>(data)
}

function countTernaries(ejs: string) {
    return (ejs.match(/=.*?.*:/g) ?? []).length * Stats.Weights.ternary
}

function countIfs(ejs: string) {
    return (ejs.match(/<% if /g) ?? []).length * Stats.Weights.if_then
}

function countElses(ejs: string) {
    return (ejs.match(/<% } else { %>/g) ?? []).length * Stats.Weights.if_else
}

function countReferences(ejs: string) {
    return (ejs.match(/<%=\s*([^%?]*?)\s*%>/g) ?? []).length * Stats.Weights.reference
}
