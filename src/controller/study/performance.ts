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
        const tmp = files.temporaryDirent()
        files.copy(application.dir, tmp)
        const original = path.join(tmp, 'variable-service-template.yaml')
        const enriched = path.join(tmp, 'variable-service-template-enriched.yaml')
        const tests = path.join(tmp, 'tests')
        const variants = files.listDirectories(tests)

        /**
         * Enrichment
         */
        const enrich = async (context: Context) => {
            std.log(day().toISOString(), application.name, 'enrichment', context.run)

            files.removeFile(enriched, {silent: true})

            performance.start('enricher_total')
            await Controller.template.enrich({
                template: original,
                output: enriched,
            })
            performance.stop('enricher_total')

            const measurement: TimeMeasurement = {
                total: performance.duration('enricher_total'),
                work: performance.duration('enricher_run'),
            }
            performance.clear('enricher_total')
            performance.clear('enricher_run')

            return measurement
        }
        data.push(await measure('enrichment', enrich, config.runs))

        /**
         * Resolving
         */
        for (const variant of variants) {
            const resolve = async (context: Context) => {
                std.log(day().toISOString(), application.name, variant, context.run)

                const resolved = path.join(tmp, `variable-service-template.${variant}.yaml`)
                const inputs = path.join(tests, variant, 'inputs.yaml')
                const expected = path.join(tests, variant, 'expected.yaml')
                files.removeFile(resolved, {silent: true})

                performance.start('resolver_total')
                await Controller.template.resolve({
                    template: enriched,
                    output: resolved,
                    inputs: inputs,
                    enrich: false,
                })
                performance.stop('resolver_total')

                const result = new Loader(resolved).raw()
                const expectedLoaded = new Loader(expected).raw()
                // TODO: must merge things into it ...
                const diff = jsonDiff.diffString(expectedLoaded, result)
                //if (diff) std.log(diff)

                const measurement: TimeMeasurement = {
                    total: performance.duration('resolver_total'),
                    work: performance.duration('resolver_run'),
                }
                performance.clear('resolver_total')
                performance.clear('resolver_run')

                return measurement
            }
            data.push(await measure(variant, resolve, config.runs))
        }

        /**
         * Modeled Elements
         */
        const stats = await Controller.template.stats({
            template: [original],
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
        files.removeDirectory(tmp)
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

async function measure(name: string, worker: (context: Context) => Promise<TimeMeasurement>, runs: number) {
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
