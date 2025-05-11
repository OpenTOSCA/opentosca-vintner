import * as assert from '#assert'
import Controller from '#controller'
import * as files from '#files'
import Loader from '#graph/loader'
import std from '#std'
import day from '#utils/day'
import performance from '#utils/performance'
import jsonDiff from 'json-diff'
import util from 'node:util'
import path from 'path'

export type StudyOptions = {
    config?: string
    experimental: Boolean
}

export type Config = {
    study: 'performance'
    applications: {
        dir: string
        name: string
    }[]
    runs: number
}

export type Measurement = {
    application: string
    elements: number
    data: TimeSeries[]
}

export type TimeSeries = {
    name: string
    data: TimeMeasurement[]
}

export type TimeMeasurement = {
    total: number
    work: number
}

// TODO: tikz

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
        const data: TimeSeries[] = []
        const workingDirectory = files.temporaryDirent()
        files.copy(application.dir, workingDirectory)
        const originalTemplateFile = path.join(workingDirectory, 'variable-service-template.yaml')
        const enrichedTemplateFile = path.join(workingDirectory, 'variable-service-template-enriched.yaml')
        const testsDirectory = path.join(workingDirectory, 'tests')
        const variants = files.listDirectories(testsDirectory)

        /**
         * Enrichment
         */
        data.push(
            await collect(
                'enrichment',
                async (context: Context) => {
                    std.log(day().toISOString(), application.name, 'enrichment', context.run)
                    files.removeFile(enrichedTemplateFile, {silent: true})

                    performance.start('enricher_total')
                    await Controller.template.enrich({
                        template: originalTemplateFile,
                        output: enrichedTemplateFile,
                    })
                    performance.stop('enricher_total')

                    const measurement: TimeMeasurement = {
                        total: performance.duration('enricher_total'),
                        work: performance.duration('enricher_run'),
                    }
                    performance.clear('enricher_total')
                    performance.clear('enricher_run')

                    return measurement
                },
                config.runs
            )
        )

        /**
         * Resolving
         */
        for (const variant of variants) {
            data.push(
                await collect(
                    variant,
                    async (context: Context) => {
                        std.log(day().toISOString(), application.name, variant, context.run)

                        const resolvedTemplateFile = path.join(
                            workingDirectory,
                            `variable-service-template.${variant}.yaml`
                        )
                        const resolvingInputsFile = path.join(testsDirectory, variant, 'inputs.yaml')
                        const expectedTemplateFile = path.join(testsDirectory, variant, 'expected.yaml')
                        files.removeFile(resolvedTemplateFile, {silent: true})

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
                        //if (diff) std.log(diff)

                        const measurement: TimeMeasurement = {
                            total: performance.duration('resolver_total'),
                            work: performance.duration('resolver_run'),
                        }
                        performance.clear('resolver_total')
                        performance.clear('resolver_run')

                        return measurement
                    },
                    config.runs
                )
            )
        }

        /**
         * Modeled Elements
         */
        const stats = await Controller.template.stats({
            template: [originalTemplateFile],
            experimental: true,
        })

        /**
         * Store measurement
         */
        measurements.push({
            application: application.name,
            elements: stats.edmm_elements,
            data,
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

type Context = {
    run: number
}

async function collect(name: string, worker: (context: Context) => Promise<TimeMeasurement>, runs: number) {
    const series: TimeSeries = {
        name,
        data: [],
    }

    for (let run = 0; run < runs; run++) {
        const measurement = await worker({run})
        series.data.push(measurement)
    }

    return series
}
