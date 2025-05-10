import * as assert from '#assert'
import Controller from '#controller'
import * as files from '#files'
import Loader from '#graph/loader'
import std from '#std'
import performance from '#utils/performance'
import jsonDiff from 'json-diff'
import util from 'node:util'
import path from 'path'

export type Config = {
    study: 'performance'
    applications: {
        dir: string
        name: string
    }[]
}

export type StudyOptions = {
    config?: string
    experimental: Boolean
}

export type Measurement = {
    application: string
    elements: number
    enrichment: TimeMeasurement
    resolving: ResolvingMeasurement[]
}

export type TimeMeasurement = {
    total: number
    total_pro_element: number
    run: number
    run_pro_element: number
}

export type ResolvingMeasurement = {
    variant: string
} & TimeMeasurement

// TODO: multiple runs? median

// TODO: performance marks should be unique per run? for server mode ...

export default async function (options: StudyOptions) {
    options.config = options.config ?? 'study.performance.yaml'
    assert.isTrue(options.experimental)

    const config = files.loadYAML<Config>(options.config)
    if (config.study !== 'performance') throw new Error(`Study "${config.study}" must be "performance"`)

    const measurements: Measurement[] = []

    for (const application of config.applications) {
        /**
         * Setup
         */
        const workingDirectory = files.temporaryDirent()
        files.copy(application.dir, workingDirectory)
        const originalTemplateFile = path.join(workingDirectory, 'variable-service-template.yaml')

        /**
         * Modeled Elements
         */
        const stats = await Controller.template.stats({
            template: [originalTemplateFile],
            experimental: true,
        })
        const elements = stats.edmm_elements

        /**
         * Enrichment
         */
        const enrichedTemplateFile = path.join(workingDirectory, 'variable-service-template-enriched.yaml')

        performance.start('enricher_total')
        await Controller.template.enrich({
            template: originalTemplateFile,
            output: enrichedTemplateFile,
        })
        performance.stop('enricher_total')

        const enrichmentMeasurement = {
            total: performance.duration('enricher_total'),
            total_pro_element: performance.duration('enricher_total') / elements,

            run: performance.duration('enricher_run'),
            run_pro_element: performance.duration('enricher_run') / elements,
        }

        performance.clear('enricher_total')
        performance.clear('enricher_run')

        /**
         * Resolving
         */
        const resolvingMeasurements: ResolvingMeasurement[] = []
        const testsDirectory = path.join(workingDirectory, 'tests')
        const variants = files.listDirectories(testsDirectory)
        for (const variant of variants) {
            std.log(application.name, variant)

            const resolvedTemplateFile = path.join(workingDirectory, `variable-service-template.${variant}.yaml`)
            const resolvingInputsFile = path.join(testsDirectory, variant, 'inputs.yaml')
            const expectedTemplateFile = path.join(testsDirectory, variant, 'expected.yaml')

            performance.start('resolver_total')
            await Controller.template.resolve({
                template: enrichedTemplateFile,
                output: resolvedTemplateFile,
                inputs: resolvingInputsFile,
                enrich: false,
            })
            performance.stop('resolver_total')

            const result = new Loader(resolvedTemplateFile).raw()
            const expected = new Loader(expectedTemplateFile).raw()
            // TODO: must merge things into it ...

            const diff = jsonDiff.diffString(expected, result)
            if (diff) {
                std.log('Resolving failed')
                std.log(diff)
            }

            resolvingMeasurements.push({
                variant,

                total: performance.duration('resolver_total'),
                total_pro_element: performance.duration('resolver_total') / elements,

                run: performance.duration('resolver_run'),
                run_pro_element: performance.duration('resolver_run') / elements,
            })

            performance.clear('resolver_total')
            performance.clear('resolver_run')
        }

        /**
         * Store measurement
         */
        measurements.push({
            application: application.name,
            elements,
            enrichment: enrichmentMeasurement,
            resolving: resolvingMeasurements,
        })

        /**
         * Cleanup
         */
        files.removeDirectory(workingDirectory)
    }

    /**
     * Sort measurements asc by number of elements
     */
    measurements.sort((a, b) => a.elements - b.elements)

    std.out(util.inspect(measurements, {depth: null, colors: true}))
}
