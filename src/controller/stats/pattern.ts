import * as assert from '#assert'
import * as Stats from '#controller/stats/stats'
import {calculateStats, TemplateStats} from '#controller/template/stats'
import * as files from '#files'
import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import {TopologyTemplate} from '#spec/topology-template'
import * as utils from '#utils'

export type UtilsStatsPATTERNOptions = {
    template: string
    experimental: boolean
}

export default async function (options: UtilsStatsPATTERNOptions) {
    assert.isDefined(options.template, 'Template not defined')
    assert.isTrue(options.experimental)

    /**
     * Refinement
     */
    const refinement = files.loadYAML<Refinement>(options.template)

    /**
     * VDMM Stats
     */
    const det = asServiceTemplate(refinement.detector)
    const ref = asServiceTemplate(refinement.solution)
    const vdmmStats = utils.sumObjects<TemplateStats>([
        calculateStats(det, det, options.template, {full: false}),
        calculateStats(ref, ref, options.template, {full: false}),
    ])

    /**
     * Stats
     */
    const stats = new Stats.Builder('PATTERN')

    /**
     * Models
     */
    stats.files = 1

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
     * Technologies
     */
    stats.technologies = vdmmStats.technologies

    /**
     * No Conditions
     */

    /**
     * No Expressions
     */
    stats.expressions = vdmmStats.behaviours

    /**
     * Mappings
     */
    stats.mappings += (refinement.mappings?.behaviours ?? []).length
    stats.mappings += (refinement.mappings?.relationships ?? []).length
    stats.mappings += (refinement.mappings?.properties ?? []).length
    stats.mappings += (refinement.mappings?.artifacts ?? []).length
    stats.mappings += (refinement.mappings?.stay ?? []).length

    /**
     * Result
     */
    return stats.build()
}

function asServiceTemplate(topology: TopologyTemplate): ServiceTemplate {
    return {
        tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3,
        topology_template: topology,
    }
}

type Refinement = {
    detector: TopologyTemplate
    mappings?: {
        behaviours: []
        relationships: []
        properties: []
        artifacts: []
        stay: []
    }
    solution: TopologyTemplate
}
