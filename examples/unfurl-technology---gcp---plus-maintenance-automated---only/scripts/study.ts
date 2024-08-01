import * as assert from '#assert'
import * as check from '#check'
import controller from '#controller'
import * as files from '#files'
import * as utils from '#utils'
import path from 'path'
import Graph from '../../../src/graph/graph'
import Loader from '../../../src/graph/loader'
import {UnexpectedError} from '../../../src/utils/error'

const examplesDir = path.join('..', '..')

const templateDir = path.join('..')
const templateFile = path.join(templateDir, 'variable-service-template.yaml')
const testsDir = path.join(templateDir, 'tests')

/**
 * MetricsData
 */
type MetricsData = {
    scenario: string
    models: number
    elements: number
    conditions: number
    technology_assignments: number
    lines_of_code: number
}

async function main() {
    /**
     * Graph
     */
    const template = await new Loader(templateFile).load()
    const graph = new Graph(template)

    /*******************************************************************************************************************
     *
     * Technology Rules
     *
     ******************************************************************************************************************/
    await technologyRules(graph)

    /*******************************************************************************************************************
     *
     * Metrics
     *
     ******************************************************************************************************************/

    /**
     * Docker (12 technologies are encoded in types)
     */
    const edmm_docker = await stats('EDMM Docker Variant', path.join(testsDir, 'docker', 'expected.yaml'))
    edmm_docker.technology_assignments = 12
    edmm_docker.lines_of_code += 12

    /**
     * GCP (12 technologies are encoded in types)
     */
    const edmm_gcp = await stats('EDMM GCP Variant', path.join(testsDir, 'gcp', 'expected.yaml'))
    edmm_gcp.technology_assignments = 12
    edmm_gcp.lines_of_code += 12

    /**
     * OS Medium (18 technologies are encoded in types)
     */
    const edmm_os_medium = await stats('EDMM OS Medium Variant', path.join(testsDir, 'os-medium', 'expected.yaml'))
    edmm_os_medium.technology_assignments = 18
    edmm_os_medium.lines_of_code += 18

    /**
     * OS Large (18 technologies are encoded in types)
     */
    const edmm_os_large = await stats('EDMM OS Large Variant', path.join(testsDir, 'os-large', 'expected.yaml'))
    edmm_os_large.technology_assignments = 18
    edmm_os_large.lines_of_code += 18

    /**
     * EDMM Total Default
     */
    const edmm_total_default = edmmTotal('EDMM Total', [edmm_docker, edmm_gcp, edmm_os_medium, edmm_os_large])

    /**
     * VDMM Baseline Default
     */
    const vdmm_baseline_default = await stats(
        'VDMM Baseline Default ',
        path.join(examplesDir, 'unfurl-technology---gcp---baseline-default---only', 'variable-service-template.yaml')
    )

    /**
     * VDMM+ Default Manual
     */
    const vdmm_plus_default_manual = await stats(
        'VDMM+ Default Automated Quality ',
        path.join(examplesDir, 'unfurl-technology---gcp---plus-default-manual---only', 'variable-service-template.yaml')
    )

    /**
     * VDMM+ Default Automated Quality
     */
    const vdmm_plus_default_automated_quality = await stats(
        'VDMM+ Default Automated Quality ',
        path.join(
            examplesDir,
            'unfurl-technology---gcp---plus-default-automated---only',
            'variable-service-template.yaml'
        )
    )

    /**
     * VDMM+ Default Automated Random (same as quality but with 3 more lines due to variability options)
     */
    const vdmm_plus_default_automated_random = utils.copy(vdmm_plus_default_automated_quality)
    vdmm_plus_default_automated_random.scenario = 'VDMM+ Default Automated Random'
    vdmm_plus_default_automated_random.lines_of_code += 3

    /**
     * VDMM+ Default Automated Counting (same as quality but with 4 more lines due to variability options)
     */
    const vdmm_plus_default_automated_counting = utils.copy(vdmm_plus_default_automated_quality)
    vdmm_plus_default_automated_counting.scenario = 'VDMM+ Default Automated Counting'
    vdmm_plus_default_automated_counting.lines_of_code += 4

    /**
     * Print
     */
    printTable<MetricsData>('Metrics relevant when modeling the different scenarios', [
        edmm_docker,
        edmm_gcp,
        edmm_os_large,
        edmm_os_medium,
        edmm_total_default,
        vdmm_baseline_default,
        vdmm_plus_default_manual,
        vdmm_plus_default_automated_random,
        vdmm_plus_default_automated_counting,
        vdmm_plus_default_automated_quality,
    ])

    /*******************************************************************************************************************
     *
     * Qualities
     *
     ******************************************************************************************************************/
    await qualities()

    /*******************************************************************************************************************
     *
     * Maintenance
     *
     ******************************************************************************************************************/

    /**
     * Kubernetes (12 technologies are encoded in types)
     */
    const edmm_kubernetes = await stats('EDMM Kubernetes', path.join(testsDir, 'kubernetes', 'expected.yaml'))
    edmm_kubernetes.technology_assignments = 12
    edmm_kubernetes.lines_of_code += 12

    /**
     * EDMM Total Maintenance
     */
    const edmm_total_maintenance = edmmTotal('EDMM Total', [
        edmm_docker,
        edmm_gcp,
        edmm_os_medium,
        edmm_os_large,
        edmm_kubernetes,
    ])

    /**
     * VDMM Baseline Maintenance
     */
    const vdmm_baseline_maintenance = await stats(
        'VDMM Baseline Maintenance',
        path.join(
            examplesDir,
            'unfurl-technology---gcp---baseline-maintenance---only',
            'variable-service-template.yaml'
        )
    )

    /**
     * VDMM+ Maintenance Automated Quality
     */
    const vdmm_plus_maintenance_automated_quality = await stats('VDMM+ Maintenance Automated Quality ', templateFile)

    /**
     * VDMM+ Maintenance Automated Random (same as quality but with 3 more lines due to variability options)
     */
    const vdmm_plus_maintenance_automated_random = utils.copy(vdmm_plus_maintenance_automated_quality)
    vdmm_plus_maintenance_automated_random.scenario = 'VDMM+ Maintenance Automated Random'
    vdmm_plus_maintenance_automated_random.lines_of_code += 3

    /**
     * VDMM+ Maintenance Automated Counting (same as quality but with 4 more lines due to variability options)
     */
    const vdmm_plus_maintenance_automated_counting = utils.copy(vdmm_plus_maintenance_automated_quality)
    vdmm_plus_maintenance_automated_counting.scenario = 'VDMM+ Maintenance Automated Counting'
    vdmm_plus_maintenance_automated_counting.lines_of_code += 4

    /**
     * Print
     */
    printTable<MetricsData>('Metrics relevant when modeling the maintenance scenario of our case study', [
        edmm_kubernetes,
        edmm_total_maintenance,
        vdmm_baseline_maintenance,
        vdmm_plus_maintenance_automated_random,
        vdmm_plus_maintenance_automated_counting,
        vdmm_plus_maintenance_automated_quality,
    ])
}

async function technologyRules(graph: Graph) {
    /**
     * Rules
     */
    const map = graph.serviceTemplate.topology_template?.variability?.technology_assignment_rules ?? {}
    if (check.isString(map)) throw new UnexpectedError()

    /**
     * Table
     */
    const table: {Technology: string; Component: string; Hosting?: string | string[]; Quality?: number}[] = []
    Object.entries(map).forEach(([name, rules]) => {
        rules.forEach(rule => {
            table.push({
                Technology: name,
                Component: rule.component,
                Hosting: rule.hosting,
                Quality: rule.weight,
            })
        })
    })

    /**
     * Output
     */
    console.log()
    console.log('The technology rules of our case study. Qualities range from bad (0) to good (1).')
    console.table(table)
}

/**
 * Stats
 */
async function stats(scenario: string, file: string): Promise<MetricsData> {
    const stats = await controller.template.stats({template: [file], experimental: true})
    return {
        scenario,
        models: 1,
        elements: stats.edmm_elements_without_technologies,
        conditions: stats.edmm_elements_conditions_manual,
        technology_assignments: stats.technologies,
        lines_of_code: stats.locp,
    }
}

function edmmTotal(secnario: string, variants: MetricsData[]): MetricsData {
    return {
        scenario: `${secnario} (${variants.map(it => it.scenario).join(', ')})`,
        models: variants.length,
        elements: utils.sum(variants.map(it => it.elements)),
        conditions: utils.sum(variants.map(it => it.conditions)),
        technology_assignments: utils.sum(variants.map(it => it.technology_assignments)),
        lines_of_code: utils.sum(variants.map(it => it.lines_of_code)),
    }
}

function printTable<T>(caption: string, data: T[]) {
    console.log()
    console.log(caption)
    console.table(data)
}

async function qualities() {
    /**
     * Table
     */
    type Data = {
        scenario: string
        expert: number
        non_expert: any
        random: number[]
        counting: number[]
        quality: number
    }
    const table: Data[] = []

    /**
     * Data
     */
    for (const variant of files.listDirectories(testsDir)) {
        const inputs = path.join(testsDir, variant, 'inputs.yaml')

        const quality = await controller.template.quality({template: templateFile, experimental: true, inputs})
        assert.isNumber(quality)

        // TODO: random
        const random = {min: -1, max: -1}
        assert.isObject(random)

        // TODO: counting
        const counting = {min: -1, max: -1}
        assert.isObject(counting)

        table.push({
            scenario: variant,
            expert: quality,
            non_expert: [random.min, random.max],
            random: [random.min, random.max],
            counting: [counting.min, counting.max],
            quality,
        })
    }

    /**
     * Output
     */
    console.log()
    console.log(
        'Qualities of the derived deployment models, i.e., the deployment variants, of the different scenarios ranging from bad (0) to good (1).'
    )
    console.table(table)
}

main()
