import * as assert from '#assert'
import Controller from '#controller'
import * as files from '#files'
import Loader from '#graph/loader'
import std from '#std'
import * as utils from '#utils'
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
        const enriched = path.join(tmp, 'variable-service-template-enriched.yaml')
        const tests = path.join(tmp, 'tests')
        const variants = files.listDirectories(tests)

        /**
         * Enrichment
         */
        const enrich = async (run: number) => {
            std.log(day().toISOString(), application.name, 'enrichment', run)

            files.removeFile(enriched, {silent: true})

            performance.start('enricher_total')
            await Controller.template.enrich({
                template: original,
                output: enriched,
            })
            performance.stop('enricher_total')

            const measurement: TimeMeasurement = {
                total: performance.duration('enricher_total'),
                work: performance.duration('enricher_work'),
            }
            performance.clear('enricher_total')
            performance.clear('enricher_work')

            return measurement
        }
        data.push(await measureTimeSeries('enrichment', enrich, config.runs))

        /**
         * Resolving
         */
        for (const variant of variants) {
            const resolve = async (run: number) => {
                std.log(day().toISOString(), application.name, variant, run)

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
                    work: performance.duration('resolver_work'),
                }
                performance.clear('resolver_total')
                performance.clear('resolver_work')

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
     * Plot total enrichment
     */
    std.log('----------------------------------')
    std.log('total enrichment')
    std.log(plotEnrichment(measurements, 'total'))

    /**
     * Plot work enrichment
     */
    std.log('----------------------------------')
    std.log('work enrichment')
    std.log(plotEnrichment(measurements, 'work'))

    /**
     * Plot total resolving
     */
    std.log('----------------------------------')
    std.log('total resolving')
    std.log(plotResolving(measurements, 'total'))

    /**
     * Plot work resolving
     */
    std.log('----------------------------------')
    std.log('work resolving')
    std.log(plotResolving(measurements, 'work'))

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

        const value = utils.median(series.data.map(it => it[key]))
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

        const values = series.map(s => utils.median(s.data.map(it => it[key])))
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
