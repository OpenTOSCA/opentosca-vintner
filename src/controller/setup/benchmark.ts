import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import {countLines, getSize, loadYAML, storeYAML, temporaryFile} from '#files'
import {getMedianFromSorted, hrtime2ms, prettyBytes, prettyMilliseconds, prettyNumber} from '#utils'
import Resolver from '#resolver'

type BenchmarkOptions = {
    io?: boolean
    seeds: number[]
    runs: number
    latex?: boolean
    markdown?: boolean
}

export type BenchmarkResult = {
    IO: boolean
    seed?: string
    templates?: string
    median?: string
    median_per_template?: string
    file_size?: string
    file_lines?: string
}
export type BenchmarkResults = BenchmarkResult[]

export default async function (options: BenchmarkOptions) {
    console.log('Running benchmark with following options', options)

    const results: BenchmarkResults = []
    for (const io of options.io ? [false, true] : [false]) {
        for (const seed of options.seeds) {
            const measurements = []
            let size
            let lines

            for (let run = 0; run < options.runs; run++) {
                console.log(`Running `, {io, seed, run})

                // Service template is transformed in-place!
                const serviceTemplate = generateBenchmarkServiceTemplate(seed)

                const input = temporaryFile(`vintner_benchmark_io_${io}_factor_${seed}_run_${run}_input.yaml`)
                const output = temporaryFile(`vintner_benchmark_io_${io}_factor_${seed}_run_${run}_output.yaml`)

                const start = process.hrtime()

                if (io) storeYAML(input, serviceTemplate)

                const result = await Resolver.resolve({
                    template: io ? loadYAML<ServiceTemplate>(input) : serviceTemplate,
                    inputs: {mode: 'present'},
                })

                if (io) storeYAML(output, result)

                const end = process.hrtime(start)
                const duration = hrtime2ms(end)

                if (io) {
                    size = getSize(input)
                    lines = countLines(input)
                }

                console.log(`Finished`, {io, seed, run, duration})

                measurements.push(duration)
            }

            const median = getMedianFromSorted(measurements.sort())
            const templates = 4 * seed
            const result = {
                IO: io,
                seed: prettyNumber(seed),
                templates: prettyNumber(templates),
                median: prettyMilliseconds(median),
                median_per_template: prettyMilliseconds(median / templates),
                file_size: prettyBytes(size),
                file_lines: prettyNumber(lines),
            }
            results.push(result)
        }
    }
    return results
}

export function generateBenchmarkServiceTemplate(seed: number): ServiceTemplate {
    const serviceTemplate: any = {
        tosca_definitions_version: TOSCA_DEFINITIONS_VERSION.TOSCA_VARIABILITY_1_0,
        topology_template: {
            variability: {
                inputs: {
                    mode: {
                        type: 'string',
                    },
                },
                expressions: {},
            },
            node_templates: {},
            relationship_templates: {},
        },
    }

    for (let i = 0; i < seed; i++) {
        serviceTemplate.topology_template!.variability!.expressions![`condition_${i}_present`] = {
            equal: [{get_variability_input: 'mode'}, 'present'],
        }

        serviceTemplate.topology_template!.node_templates![`component_${i}_present`] = {
            type: `component_type_${i}_present`,
            conditions: {get_variability_condition: `condition_${i}_present`},
            requirements: [
                {
                    relation_present: {
                        node: `component_${i + 1 == seed ? 0 : i + 1}_present`,
                        conditions: {get_variability_condition: `condition_${i}_present`},
                        relationship: `relationship_${i}_present`,
                    },
                },
                {
                    relation_removed: {
                        node: `component_${i + 1 == seed ? 0 : i + 1}_removed`,
                        conditions: {get_variability_condition: `condition_${i}_removed`},
                        relationship: `relationship_${i}_removed`,
                    },
                },
            ],
        }

        serviceTemplate.topology_template!.relationship_templates![`relationship_${i}_present`] = {
            type: `relationship_type_${i}_present`,
        }

        serviceTemplate.topology_template!.relationship_templates![`relationship_${i}_removed`] = {
            type: `relationship_type_${i}_removed`,
        }

        serviceTemplate.topology_template!.variability!.expressions![`condition_${i}_removed`] = {
            equal: [{get_variability_input: 'mode'}, `absent`],
        }

        serviceTemplate.topology_template!.node_templates![`component_${i}_removed`] = {
            type: `component_type_${i}_removed`,
            conditions: {get_variability_condition: `condition_${i}_removed`},
        }
    }

    return serviceTemplate
}

export function benchmark2markdown(results: BenchmarkResults) {
    const data = []
    data.push('| Test | Seed |  Templates | Median | Median per Template | I/O | File Size | File Lines | ')
    data.push('| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')

    results.forEach((result, index) => {
        data.push(
            '|' +
                [
                    index + 1,
                    result.seed,
                    result.templates,
                    result.median,
                    result.median_per_template,
                    result.IO,
                    result.file_size || '',
                    result.file_lines || '',
                ].join(' | ') +
                '|'
        )
    })

    return data.join(`\n`)
}

export function benchmark2latex(results: BenchmarkResults, options: BenchmarkOptions) {
    const data = []
    data.push('Test & Seed & Templates & Median & Median per Template & I/O & File Size & File Lines \\\\')
    data.push('\\toprule')

    results.forEach((result, index) => {
        data.push(
            [
                index + 1,
                result.seed,
                result.templates,
                result.median,
                result.median_per_template,
                result.IO,
                result.file_size || '',
                result.file_lines || '',
            ].join(' & ') + '\\\\'
        )

        if (options.io && index + 1 == options.seeds.length) data.push('\\midrule')
    })

    data.push('\\bottomrule')

    return data.join('\n')
}
