import * as assert from '#assert'
import * as check from '#check'
import Controller from '#controller'
import {loadConfig} from '#controller/template/test'
import * as files from '#files'
import Loader from '#graph/loader'
import std from '#std'
import * as utils from '#utils'
import day from '#utils/day'
import performance from '#utils/performance'
import jsonDiff from 'json-diff'
import _ from 'lodash'
import util from 'node:util'
import path from 'path'

export const PERFORMANCE_ENRICHER_TOTAL = 'enricher_total'
export const PERFORMANCE_ENRICHER_WRITE = 'enricher_write'
export const PERFORMANCE_ENRICHER_READ = 'enricher_read'
export const PERFORMANCE_ENRICHER_WORK = 'enricher_work'

export const PERFORMANCE_RESOLVER_TOTAL = 'resolver_total'
export const PERFORMANCE_RESOLVER_WRITE = 'resolver_write'
export const PERFORMANCE_RESOLVER_READ = 'resolver_read'
export const PERFORMANCE_RESOLVER_WORK = 'resolver_work'
export const PERFORMANCE_RESOLVER_SAT = 'resolver_sat'

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
    stats: {
        elements: number
        components: number
        relations: number
        properties: number
        artifacts: number
        technologies: number
        inputs: number
        outputs: number
    }
    data: TimeSeries[]
}

export type TimeSeries = {
    name: string
    data: TimeMeasurement[]
}

export type TimeMeasurement = {
    total: number
    work: number
    read: number
    write: number
    sat?: number
}

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
        const tests = path.join(tmp, 'tests')
        const variants = files.listDirectories(tests)

        /**
         * Enrichment
         */
        const enrich = async (run: number) => {
            std.log(day().toISOString(), application.name, 'enrichment', run)

            performance.start(PERFORMANCE_ENRICHER_TOTAL)
            await Controller.template.enrich({
                template: original,
                output: path.join(tmp, `variable-service-template.enriched.${run}.yaml`),
                pretty: false,
            })
            performance.stop(PERFORMANCE_ENRICHER_TOTAL)

            const measurement: TimeMeasurement = {
                total: performance.duration(PERFORMANCE_ENRICHER_TOTAL),
                work: performance.duration(PERFORMANCE_ENRICHER_WORK),
                read: performance.duration(PERFORMANCE_ENRICHER_READ),
                write: performance.duration(PERFORMANCE_ENRICHER_WRITE),
            }
            performance.clear(PERFORMANCE_ENRICHER_TOTAL)
            performance.clear(PERFORMANCE_ENRICHER_WORK)
            performance.clear(PERFORMANCE_ENRICHER_READ)
            performance.clear(PERFORMANCE_ENRICHER_WRITE)

            return measurement
        }
        data.push(await measureTimeSeries('enrichment', enrich, config.runs))

        /**
         * Resolving
         */
        for (const variant of variants) {
            const resolve = async (run: number) => {
                std.log(day().toISOString(), application.name, variant, run)

                const resolved = path.join(tmp, `service-template.resolved.${variant}.${run}.yaml`)
                const inputs = path.join(tests, variant, 'inputs.yaml')
                const expected = path.join(tests, variant, `expected.yaml`)

                performance.start(PERFORMANCE_RESOLVER_TOTAL)
                await Controller.template.resolve({
                    template: path.join(tmp, `variable-service-template.enriched.${run}.yaml`),
                    output: resolved,
                    inputs: inputs,
                    enrich: false,
                    pretty: false,
                })
                performance.stop(PERFORMANCE_RESOLVER_TOTAL)

                const resultLoaded = new Loader(resolved).raw()
                const expectedLoaded = new Loader(expected).raw()
                const testConfig = loadConfig(path.join(tests, variant))
                if (check.isDefined(testConfig.merge)) _.merge(expectedLoaded, testConfig.merge)
                const diff = jsonDiff.diffString(expectedLoaded, resultLoaded)
                if (diff) std.log(diff)

                const measurement: TimeMeasurement = {
                    total: performance.duration(PERFORMANCE_RESOLVER_TOTAL),
                    work: performance.duration(PERFORMANCE_RESOLVER_WORK),
                    read: performance.duration(PERFORMANCE_RESOLVER_READ),
                    write: performance.duration(PERFORMANCE_RESOLVER_WRITE),
                    sat: performance.duration(PERFORMANCE_RESOLVER_SAT),
                }
                performance.clear(PERFORMANCE_RESOLVER_TOTAL)
                performance.clear(PERFORMANCE_RESOLVER_WORK)
                performance.clear(PERFORMANCE_RESOLVER_READ)
                performance.clear(PERFORMANCE_RESOLVER_WRITE)
                performance.clear(PERFORMANCE_RESOLVER_SAT)

                return measurement
            }
            data.push(await measureTimeSeries(variant, resolve, config.runs))
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
            stats: {
                elements: stats.edmm_elements,
                components: stats.nodes,
                relations: stats.relations,
                properties: stats.properties,
                artifacts: stats.artifacts,
                technologies: stats.technologies,
                inputs: stats.inputs,
                outputs: stats.outputs,
            },
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
    measurements.sort((a, b) => a.stats.elements - b.stats.elements)

    /**
     * Return data
     */
    std.out(util.inspect(measurements, {depth: null, colors: true}))

    /**
     * Plot enrichment
     */
    std.log('----------------------------------')
    std.log('Enrichment Total')
    std.log(plotEnrichment(measurements, 'total'))
    std.log('----------------------------------')
    std.log('Enrichment Work')
    std.log(plotEnrichment(measurements, 'work'))
    std.log('----------------------------------')
    std.log('Enrichment Read')
    std.log(plotEnrichment(measurements, 'read'))
    std.log('----------------------------------')
    std.log('Enrichment Write')
    std.log(plotEnrichment(measurements, 'write'))

    /**
     * Plot resolving
     */
    std.log('----------------------------------')
    std.log('Resolving Total')
    std.log(plotResolving(measurements, 'total'))
    std.log('----------------------------------')
    std.log('Resolving Work')
    std.log(plotResolving(measurements, 'work'))
    std.log('----------------------------------')
    std.log('Resolving Read')
    std.log(plotResolving(measurements, 'read'))
    std.log('----------------------------------')
    std.log('Resolving Write')
    std.log(plotResolving(measurements, 'write'))
    std.log('----------------------------------')
    std.log('Resolving SAT')
    std.log(plotResolving(measurements, 'sat'))

    /**
     * Plot stats
     */
    std.log('----------------------------------')
    std.log('stats')
    std.log(plotStats(measurements))
}

async function measureTimeSeries(name: string, worker: (run: number) => Promise<TimeMeasurement>, runs: number) {
    const series: TimeSeries = {
        name,
        data: [],
    }

    for (let run = 0; run < runs; run++) {
        const measurement = await worker(run)
        series.data.push(measurement)
    }

    return series
}

function plotEnrichment(measurements: Measurement[], key: keyof TimeMeasurement) {
    const coordinates: string[] = []
    const labels: string[] = []

    measurements.forEach(m => {
        const series = m.data.find(it => it.name === 'enrichment')
        assert.isDefined(series)

        const value = utils.median(series.data.map(it => it[key]!))
        coordinates.push(`(${m.stats.elements},${value})`)
        labels.push(`\\node at (axis cs:${m.stats.elements},${value}) {${m.application}};`)
    })

    return `
\\addplot+[color=black, mark=square*, mark options={fill=black}] coordinates {
    ${coordinates.join(' ')}
};

${labels.join('\n')}
    `
}

function plotResolving(measurements: Measurement[], key: keyof TimeMeasurement) {
    const dots: string[] = []
    const coordinates: string[] = []
    const labels: string[] = []

    measurements.forEach(m => {
        const series = m.data.filter(it => it.name !== 'enrichment')

        const values = series.map(s => utils.median(s.data.map(it => it[key]!)))
        values.forEach(it => dots.push(`(${m.stats.elements},${it})`))

        const value = utils.average(values)
        coordinates.push(`(${m.stats.elements},${value})`)
        labels.push(`\\node at (axis cs:${m.stats.elements},${value}) {${m.application}};`)
    })

    return `
\\addplot+[color=black, mark=x, only marks, mark options={fill=black}] coordinates {
    ${dots.join(' ')}
};    

\\addplot+[color=black, mark=square*, mark options={fill=black}] coordinates {
    ${coordinates.join(' ')}
};

${labels.join('\n')}
    `
}

function plotStats(measurements: Measurement[]) {
    const rows: string[] = []

    measurements.forEach(m => {
        const row =
            [
                m.application,
                m.stats.elements,
                m.stats.components,
                m.stats.relations,
                m.stats.properties,
                m.stats.artifacts,
                m.stats.technologies,
                m.stats.inputs,
                m.stats.outputs,
            ].join(' & ') + ' \\\\ \n'
        rows.push(row)
    })

    return rows.join('')
}
