import * as assert from '#assert'
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
     * Mapping
     */
    const mappingFile = path.join(options.dir, 'mapping.yaml')
    const mappingExists = files.exists(mappingFile)

    /**
     * Template
     */
    const templateFile = path.join(options.dir, 'model.yaml')

    /**
     * Stats
     */
    const stats = new Stats.Builder(Stats.ID.tosca_fm)

    // TODO: this

    /**
     * Result
     */
    return stats.build()
}
