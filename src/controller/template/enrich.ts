import * as assert from '#assert'
import {PERFORMANCE_ENRICHER_READ, PERFORMANCE_ENRICHER_WRITE} from '#controller/study/performance'
import Enricher from '#enricher'
import * as files from '#files'
import Loader from '#graph/loader'
import performance from '#utils/performance'

export type TemplateEnrichOptions = {
    template: string
    presets?: string[]
    inputs?: string
    output: string
    pretty?: boolean
}

export default async function (options: TemplateEnrichOptions) {
    assert.isDefined(options.template, 'Template not defined')
    assert.isDefined(options.output, 'Output not defined')

    performance.start(PERFORMANCE_ENRICHER_READ)
    const template = await new Loader(options.template).load()
    performance.stop(PERFORMANCE_ENRICHER_READ)

    await new Enricher(template).run()

    performance.start(PERFORMANCE_ENRICHER_WRITE)
    files.storeYAML(options.output, template, {pretty: options.pretty})
    performance.stop(PERFORMANCE_ENRICHER_WRITE)
}
