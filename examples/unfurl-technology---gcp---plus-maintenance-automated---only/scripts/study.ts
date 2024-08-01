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
    /**
     * Rules
     */
    const map = graph.serviceTemplate.topology_template?.variability?.technology_assignment_rules ?? {}
    if (check.isString(map)) throw new UnexpectedError()

    /**
     * Table
     */
    const ruleData: RuleData[] = []
    Object.entries(map).forEach(([name, rules]) => {
        rules.forEach(rule => {
            ruleData.push({
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
    printTable<RuleData>('The technology rules of our case study. Qualities range from bad (0) to good (1).', ruleData)

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
    const edmm_total_default = sumMetrics('EDMM Total', [edmm_docker, edmm_gcp, edmm_os_medium, edmm_os_large])

    /**
     * VDMM Baseline Default
     */
    const vdmm_baseline_default = await stats(
        'VDMM Baseline Default',
        path.join(examplesDir, 'unfurl-technology---gcp---baseline-default---only', 'variable-service-template.yaml')
    )

    /**
     * VDMM+ Default Manual
     */
    const vdmm_plus_default_manual = await stats(
        'VDMM+ Default Manual',
        path.join(examplesDir, 'unfurl-technology---gcp---plus-default-manual---only', 'variable-service-template.yaml')
    )

    /**
     * VDMM+ Default Automated Quality
     */
    const vdmm_plus_default_automated_quality = await stats(
        'VDMM+ Default Automated Quality',
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

    /**
     * Table
     */
    const qualityData: QualityData[] = []

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

        qualityData.push({
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
    printTable<QualityData>(
        'Qualities of the derived deployment models, i.e., the deployment variants, of the different scenarios ranging from bad (0) to good (1).',
        qualityData
    )

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
    const edmm_total_maintenance = sumMetrics('EDMM Total Maintenance', [
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
     * VDMM+ Maintenance Manual
     */
    const vdmm_plus_maintenance_manual = await stats(
        'VDMM+ Maintenance Manual',
        path.join(
            examplesDir,
            'unfurl-technology---gcp---plus-maintenance-manual---only',
            'variable-service-template.yaml'
        )
    )

    /**
     * VDMM+ Maintenance Automated Quality
     */
    const vdmm_plus_maintenance_automated_quality = await stats('VDMM+ Maintenance Automated Quality', templateFile)

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
        vdmm_plus_maintenance_manual,
        vdmm_plus_maintenance_automated_random,
        vdmm_plus_maintenance_automated_counting,
        vdmm_plus_maintenance_automated_quality,
    ])

    /*******************************************************************************************************************
     *
     * Absolute Diff
     *
     ******************************************************************************************************************/

    /**
     * EDMM Total Diff
     */
    const edmm_total_diff = absoluteDiff(edmm_total_maintenance, edmm_total_default)

    /**
     * VDMM Baseline Diff
     */
    const vdmm_baseline_diff = absoluteDiff(vdmm_baseline_maintenance, vdmm_baseline_default)

    /**
     * VDMM+ Manual Diff
     */
    const vdmm_plus_manual_diff = absoluteDiff(vdmm_plus_maintenance_manual, vdmm_plus_default_manual)

    /**
     * VDMM+ Automated Diff
     */
    const vdmm_plus_automated_diff = absoluteDiff(
        vdmm_plus_maintenance_automated_quality,
        vdmm_plus_default_automated_quality
    )

    /**
     * Output
     */
    printTable<MetricsDataAbsDiff>('From Default to Maintained (Absolut to previous)', [
        edmm_total_diff,
        vdmm_baseline_diff,
        vdmm_plus_manual_diff,
        vdmm_plus_automated_diff,
    ])

    /*******************************************************************************************************************
     *
     * Relative Diff
     *
     ******************************************************************************************************************/

    /**
     * Relative Diff of "VDMM+ Maintenance Manual - VDMM+ Default Manual" in constrast to "VDMM Baseline Maintenance - VDMM Baseline Default"
     */
    const vdmm_plus_manual_diff_relative_diff = relativeDiff(vdmm_plus_manual_diff, vdmm_baseline_diff)

    /**
     * Relative Diff of "VDMM+ Maintenance Automated Quality - VDMM+ Default Automated Quality" in constrast to "VDMM Baseline Maintenance - VDMM Baseline Default"
     */
    const vdmm_plus_automated_quality_diff_relative_diff = relativeDiff(vdmm_plus_automated_diff, vdmm_baseline_diff)

    /**
     * Output
     */
    printTable<MetricsDataRelDiff>('From Default to Maintained (Relative to change to baseline) ', [
        vdmm_plus_manual_diff_relative_diff,
        vdmm_plus_automated_quality_diff_relative_diff,
    ])
}

type RuleData = {Technology: string; Component: string; Hosting?: string | string[]; Quality?: number}

type QualityData = {
    scenario: string
    expert: number
    non_expert: any
    random: number[]
    counting: number[]
    quality: number
}

type MetricsData = {
    scenario: string
    short?: string
    models: number
    elements: number
    conditions: number
    technology_assignments: number
    lines_of_code: number
}

type MetricsDataAbsDiff = {
    scenario: string
    models_absolute_diff: number
    elements_absolute_diff: number
    conditions_absolute_diff: number
    technology_assignments_absolute_diff: number
    lines_of_code_absolute_diff: number
}

type MetricsDataRelDiff = {
    scenario: string
    //  models_relative_diff: number
    elements_relative_diff: number
    conditions_relative_diff: number
    technology_assignments_relative_diff: number
    lines_of_code_relative_diff: number
}

function absoluteDiff(maintained: MetricsData, previous: MetricsData): MetricsDataAbsDiff {
    return {
        scenario: `${maintained.short ?? maintained.scenario} - ${previous.short ?? previous.scenario}`,
        models_absolute_diff: maintained.models - previous.models,
        elements_absolute_diff: maintained.elements - previous.elements,
        conditions_absolute_diff: maintained.conditions - previous.conditions,
        technology_assignments_absolute_diff: maintained.technology_assignments - previous.technology_assignments,
        lines_of_code_absolute_diff: maintained.lines_of_code - previous.lines_of_code,
    }
}

function relativeDiff(maintained: MetricsDataAbsDiff, previous: MetricsDataAbsDiff): MetricsDataRelDiff {
    return {
        scenario: `(${maintained.scenario}) / (${previous.scenario})`,
        //        models_relative_diff: maintained.models_absolute_diff / previous.models_absolute_diff,
        elements_relative_diff: utils.roundNumber(maintained.elements_absolute_diff / previous.elements_absolute_diff),
        conditions_relative_diff: utils.roundNumber(
            maintained.conditions_absolute_diff / previous.conditions_absolute_diff
        ),
        technology_assignments_relative_diff: utils.roundNumber(
            maintained.technology_assignments_absolute_diff / previous.technology_assignments_absolute_diff
        ),
        lines_of_code_relative_diff: utils.roundNumber(
            maintained.lines_of_code_absolute_diff / previous.lines_of_code_absolute_diff
        ),
    }
}

function sumMetrics(scenario: string, variants: MetricsData[]): MetricsData {
    return {
        scenario: `${scenario} (${variants.map(it => it.scenario).join(', ')})`,
        short: scenario,
        models: variants.length,
        elements: utils.sum(variants.map(it => it.elements)),
        conditions: utils.sum(variants.map(it => it.conditions)),
        technology_assignments: utils.sum(variants.map(it => it.technology_assignments)),
        lines_of_code: utils.sum(variants.map(it => it.lines_of_code)),
    }
}

async function stats(scenario: string, file: string): Promise<MetricsData> {
    const stats = await controller.template.stats({template: [file], experimental: true})
    return {
        scenario,
        models: 1,
        elements: stats.edmm_elements_without_technologies,
        conditions: stats.edmm_elements_conditions_manual,
        technology_assignments: stats.technologies,
        lines_of_code: stats.loc,
    }
}

function printTable<T>(caption: string, data: T[]) {
    console.log()
    console.log(caption)
    console.table(data)
}

main()
