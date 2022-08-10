import {ServiceTemplate, TOSCA_DEFINITIONS_VERSION} from '../src/specification/service-template'
import {Model} from '../src/repository/model'
import {countLines, getSize, loadFile, storeFile, temporaryFile} from '../src/utils/files'

const config = {
    ios: [false, true],
    seeds: [10, 250, 500, 1000, 2500, 5000, 10000],
    //seeds: [10, 250, 500],
    runs: 10,
}

const result = benchmark()

console.log()
plotMarkdown(result)

console.log()
plotLatex(result)

console.log()
console.table(result)

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

function benchmark() {
    const results: Results = []

    for (const io of config.ios) {
        for (const seed of config.seeds) {
            const measurements = []
            const serviceTemplate = constructServiceTemplate(seed)
            let size
            let lines

            for (let run = 0; run < config.runs; run++) {
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
                const duration = (end[0] * 1000000000 + end[1]) / 1000000

                if (io) {
                    size = getSize(input)
                    lines = countLines(input)
                }

                measurements.push(duration)
            }
            measurements.sort()
            const median = (measurements[config.runs / 2 - 1] + measurements[config.runs / 2]) / 2
            const templates = 4 * seed
            const result = {
                IO: io,
                seed: prettyNumber(seed),
                templates: prettyNumber(templates),
                median: prettyMilliseconds(median),
                median_per_template: prettyNumber(median / templates) + ' ms',
                file_size: prettyBytes(size),
                file_lines: prettyNumber(lines),
            }
            results.push(result)
        }
    }

    return results
}

function prettyBytes(bytes?: number) {
    if (bytes === undefined) return
    const kb = bytes / 1000
    const mb = kb / 1000
    return kb > 1000 ? `${prettyNumber(mb)} mb` : `${prettyNumber(Math.round(kb))} kb`
}

function prettyMilliseconds(ms?: number) {
    if (ms === undefined) return
    const s = ms / 1000
    return ms > 1000 ? `${s.toFixed(3)} s` : `${ms.toFixed(3)} ms`
}

function prettyNumber(number?: number) {
    if (number === undefined) return
    if (Number.isInteger(number)) return number.toLocaleString('en')
    return number.toLocaleString('en', {maximumFractionDigits: 3, minimumFractionDigits: 3})
}

function constructServiceTemplate(seed: number): ServiceTemplate {
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

function plotMarkdown(results: Results) {
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

    console.log(data.join(`\n`))
}

function plotLatex(results: Results) {
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

        console.log({index, cond: index === config.seeds.length})

        if (index + 1 == config.seeds.length) data.push('\\midrule')
    })

    data.push('\\bottomrule')

    console.log(data.join('\n'))
}
