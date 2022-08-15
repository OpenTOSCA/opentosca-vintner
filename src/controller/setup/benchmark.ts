import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '../../specification/service-template'
import {Model} from '../../repository/model'
import {countLines, getSize, loadFile, storeFile, temporaryFile} from '../../utils/files'
import {getMedianFromSorted, hrtime2ms, prettyBytes, prettyMilliseconds, prettyNumber} from '../../utils/utils'

type BenchmarkArguments = {
    io: boolean
    seeds: number[]
    runs: number
    latex: boolean
    markdown: boolean
}

type Result = {
    IO: boolean
    seed: string
    templates: string
    median: string
    median_per_template: string
    file_size: string
    file_lines: string
}

type Results = Result[]

export default async function (options: BenchmarkArguments) {
    console.log('Running benchmark with following options', options)

    const benchmark = new Benchmark(options)

    const results = benchmark.run()
    console.table(results)

    if (options.markdown) console.log('\n', benchmark.toMarkdown())
    if (options.latex) console.log('\n', benchmark.toLatex())
}

class Benchmark {
    private readonly options: BenchmarkArguments
    private results: Results = []

    constructor(options: BenchmarkArguments) {
        this.options = options
    }

    run() {
        this.results = []

        for (const io of this.options.io ? [false, true] : [false]) {
            for (const seed of this.options.seeds) {
                const measurements = []
                const serviceTemplate = this.constructServiceTemplate(seed)
                let size
                let lines

                for (let run = 0; run < this.options.runs; run++) {
                    console.log(`Running`, {io, seed, run})

                    const input = temporaryFile(`vintner_benchmark_io_${io}_factor_${seed}_run_${run}_input.yaml`)
                    const output = temporaryFile(`vintner_benchmark_io_${io}_factor_${seed}_run_${run}_output.yaml`)

                    const start = process.hrtime()

                    if (io) storeFile(input, serviceTemplate)

                    const model = new Model(io ? loadFile<ServiceTemplate>(input) : serviceTemplate)
                        .setVariabilityInputs({mode: 'present'})
                        .resolveVariability()
                        .checkConsistency()
                        .finalize()

                    if (io) storeFile(output, model.getServiceTemplate())

                    const end = process.hrtime(start)
                    const duration = hrtime2ms(end)

                    if (io) {
                        size = getSize(input)
                        lines = countLines(input)
                    }

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
                this.results.push(result)
            }
        }

        return this.results
    }

    constructServiceTemplate(seed: number): ServiceTemplate {
        const serviceTemplate: ServiceTemplate = {
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
            },
        }

        for (let i = 0; i < seed; i++) {
            serviceTemplate.topology_template.variability.expressions[`condition_${i}_present`] = {
                equal: [{get_variability_input: 'mode'}, 'present'],
            }

            serviceTemplate.topology_template.node_templates[`component_${i}_present`] = {
                type: `component_type_${i}_present`,
                conditions: {get_variability_condition: `condition_${i}_present`},
                requirements: [
                    {
                        relation: {
                            node: `component_${i + 1 == seed ? 0 : i + 1}_present`,
                            conditions: {get_variability_condition: `condition_${i}_present`},
                        },
                    },
                ],
            }

            serviceTemplate.topology_template.variability.expressions[`condition_${i}_removed`] = {
                equal: [{get_variability_input: 'mode'}, `component_${i}_removed`],
            }

            serviceTemplate.topology_template.node_templates[`component_${i}_removed`] = {
                type: `component_type_${i}_removed`,
                conditions: {get_variability_condition: `condition_${i}_removed`},
            }
        }

        return serviceTemplate
    }

    getResults() {
        return this.results
    }

    toMarkdown() {
        const data = []
        data.push('| Test | Seed |  Templates | Median | Median per Template | I/O | File Size | File Lines | ')
        data.push('| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')

        this.results.forEach((result, index) => {
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

    toLatex() {
        const data = []
        data.push('Test & Seed & Templates & Median & Median per Template & I/O & File Size & File Lines \\\\')
        data.push('\\toprule')

        this.results.forEach((result, index) => {
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

            if (this.options.io && index + 1 == this.options.seeds.length) data.push('\\midrule')
        })

        data.push('\\bottomrule')

        return data.join('\n')
    }
}
