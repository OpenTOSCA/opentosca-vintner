import * as assert from '#assert'
import Controller from '#controller'
import * as Stats from '#controller/stats/stats'
import * as files from '#files'
import path from 'path'

export type UtilsStatsTOSCAFMOptions = {
    dir: string
    experimental: boolean
}

export default async function (options: UtilsStatsTOSCAFMOptions) {
    assert.isDefined(options.dir, 'Directory not defined')
    assert.isTrue(options.experimental)

    /**
     * Service Mapping
     */
    const mappingFile = path.join(options.dir, 'mappings.yaml')
    const mappingExists = files.exists(mappingFile)
    const mappingStats = mappingExists
        ? await Controller.stats.tosca({
              template: mappingFile,
              experimental: true,
          })
        : undefined
    console.log(mappingStats)

    /**
     * Service Template
     */
    const templateFile = path.join(options.dir, 'model.yaml')
    const templateStats = await Controller.stats.tosca({
        template: templateFile,
        experimental: true,
    })

    /**
     * Stats
     */
    const stats = new Stats.Builder(Stats.ID.tosca_fm)

    /**
     * Models
     */
    stats.files += 2

    /**
     * LOC
     */
    stats.loc += mappingExists ? mappingStats!.loc : 0
    stats.loc += templateStats.loc

    /**
     * Inputs
     */
    stats.inputs += templateStats.inputs

    /**
     * Outputs
     */
    stats.outputs += templateStats.outputs

    /**
     * Components
     */
    stats.components += templateStats.components

    /**
     * Properties
     */
    stats.properties += templateStats.properties

    /**
     * Relations
     */
    stats.relations += templateStats.relations

    /**
     * Artifacts
     */
    stats.artifacts += templateStats.artifacts

    /**
     * No Technologies (its part of the scenario encoded in the node type)
     */

    /**
     * Conditions
     */
    stats.conditions += templateStats.conditions

    /**
     * Expressions
     */
    stats.expressions += templateStats.expressions
    stats.expressions += mappingExists ? mappingStats!.elements : 0

    /**
     * Mappings
     */
    stats.mappings += templateStats.mappings

    /**
     * Result
     */
    return stats.build()
}
