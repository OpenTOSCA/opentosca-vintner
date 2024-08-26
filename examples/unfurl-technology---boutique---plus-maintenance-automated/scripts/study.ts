import * as check from '#check'
import controller from '#controller'
import * as files from '#files'
import Graph from '#graph/graph'
import Loader from '#graph/loader'
import * as utils from '#utils'
import {UnexpectedError} from '#utils/error'
import path from 'path'

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
                Comment: rule.comment,
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
     * GCP (12 technologies are encoded in types)
     */
    const edmm_gcp = await stats('EDMM GCP Variant', path.join(testsDir, 'gcp', 'expected.yaml'))
    edmm_gcp.technology_assignments = 14
    edmm_gcp.lines_of_code += 14

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
     * EDMM Total Original
     */
    const edmm_variants_original = [edmm_gcp, edmm_os_medium, edmm_os_large]
    const edmm_total_original = sumMetrics('EDMM Total', edmm_variants_original)

    /**
     * VDMM Baseline Original
     */
    const vdmm_baseline_original = await stats(
        'VDMM Baseline Original',
        path.join(
            examplesDir,
            'unfurl-technology---boutique---baseline-original---disabled',
            'variable-service-template.yaml'
        )
    )

    /**
     * VDMM+ Original Manual
     */
    const vdmm_plus_original_manual = await stats(
        'VDMM+ Original Manual',
        path.join(examplesDir, 'unfurl-technology---boutique---plus-original-manual', 'variable-service-template.yaml')
    )

    /**
     * VDMM+ Original Automated Quality
     */
    const vdmm_plus_original_automated_quality = await stats(
        'VDMM+ Original Automated Quality',
        path.join(
            examplesDir,
            'unfurl-technology---boutique---plus-original-automated',
            'variable-service-template.yaml'
        )
    )

    /**
     * VDMM+ Original Automated Random (same as quality but with 3 more lines due to variability options)
     */
    const vdmm_plus_original_automated_random = utils.copy(vdmm_plus_original_automated_quality)
    vdmm_plus_original_automated_random.scenario = 'VDMM+ Original Automated Random'
    vdmm_plus_original_automated_random.lines_of_code += 3

    /**
     * VDMM+ Original Automated Counting (same as quality but with 4 more lines due to variability options)
     */
    const vdmm_plus_original_automated_counting = utils.copy(vdmm_plus_original_automated_quality)
    vdmm_plus_original_automated_counting.scenario = 'VDMM+ Original Automated Counting'
    vdmm_plus_original_automated_counting.lines_of_code += 4

    /**
     * Print
     */
    printTable<MetricsData>('Metrics relevant when modeling the different scenarios', [
        edmm_gcp,
        edmm_os_large,
        edmm_os_medium,
        edmm_total_original,
        vdmm_baseline_original,
        vdmm_plus_original_manual,
        vdmm_plus_original_automated_random,
        vdmm_plus_original_automated_counting,
        vdmm_plus_original_automated_quality,
    ])

    /*******************************************************************************************************************
     *
     * Diff of the Original Models
     *
     ******************************************************************************************************************/

    // TODO: rel of baseline to edmm total
    // TODO: rel of vdmm+

    /**
     * Diff of VDMM Baseline Original to EDMM Total
     */
    const vdmm_baseline_original_diff = originalDiff(vdmm_baseline_original, edmm_total_original)

    /**
     * Diff of VDMM+ Original Manual to VDMM Baseline Original
     */
    const vdmm_plus_original_manual_baseline_diff = originalDiff(vdmm_plus_original_manual, vdmm_baseline_original)

    /**
     * Diff of VDMM+ Original Automated Random to VDMM Baseline Original
     */
    const vdmm_plus_original_automated_random_baseline_diff = originalDiff(
        vdmm_plus_original_automated_random,
        vdmm_baseline_original
    )

    /**
     * Diff of VDMM+ Original Automated Counting to VDMM Baseline Original
     */
    const vdmm_plus_original_automated_counting_baseline_diff = originalDiff(
        vdmm_plus_original_automated_counting,
        vdmm_baseline_original
    )

    /**
     * Diff of VDMM+ Original Automated Quality to VDMM Baseline Original
     */
    const vdmm_plus_original_automated_quality_baseline_diff = originalDiff(
        vdmm_plus_original_automated_quality,
        vdmm_baseline_original
    )

    // TODO: quality counting?! its the same metrics ...

    /**
     * Print
     */
    printTable<MetricsDataOriginalDiff>('Diff when modeling the different original scenarios', [
        vdmm_baseline_original_diff,
        vdmm_plus_original_manual_baseline_diff,
        vdmm_plus_original_automated_random_baseline_diff,
        vdmm_plus_original_automated_counting_baseline_diff,
        vdmm_plus_original_automated_quality_baseline_diff,
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

        const quality = await controller.template.quality({
            template: templateFile,
            experimental: true,
            inputs,
        })

        qualityData.push({
            scenario: variant,
            expert: quality.max_weight,
            non_expert: [quality.min_weight, quality.max_weight],
            random: [quality.min_weight, quality.max_weight],
            counting: [quality.min_count.min, quality.min_count.max],
            quality: quality.max_weight,
            quality_counting: quality.max_weight_min_count,
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
    edmm_kubernetes.technology_assignments = 13
    edmm_kubernetes.lines_of_code += 13

    /**
     * EDMM Total Maintenance
     */
    const edmm_total_maintenance = sumMetrics('EDMM Total Maintenance', [...edmm_variants_original, edmm_kubernetes])

    /**
     * VDMM Baseline Maintenance
     */
    const vdmm_baseline_maintenance = await stats(
        'VDMM Baseline Maintenance',
        path.join(
            examplesDir,
            'unfurl-technology---boutique---baseline-maintenance---disabled',
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
            'unfurl-technology---boutique---plus-maintenance-manual',
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
     * Absolute Diff of the Adaptation
     *
     ******************************************************************************************************************/

    /**
     * EDMM Total Diff
     */
    const edmm_total_diff = absoluteMaintenanceDiff(edmm_total_maintenance, edmm_total_original)

    /**
     * VDMM Baseline Diff
     */
    const vdmm_baseline_diff = absoluteMaintenanceDiff(vdmm_baseline_maintenance, vdmm_baseline_original)

    /**
     * VDMM+ Manual Diff
     */
    const vdmm_plus_manual_diff = absoluteMaintenanceDiff(vdmm_plus_maintenance_manual, vdmm_plus_original_manual)

    /**
     * VDMM+ Automated Diff
     */
    const vdmm_plus_automated_diff = absoluteMaintenanceDiff(
        vdmm_plus_maintenance_automated_quality,
        vdmm_plus_original_automated_quality
    )

    /**
     * Output
     */
    printTable<MetricsDataAbsoluteDiff>('From Original to Maintained (Absolut to previous) (Absolute)', [
        edmm_total_diff,
        vdmm_baseline_diff,
        vdmm_plus_manual_diff,
        vdmm_plus_automated_diff,
    ])

    /*******************************************************************************************************************
     *
     * Relative Diff of the Adaptation
     *
     ******************************************************************************************************************/

    /**
     * Relative Diff of "VDMM+ Maintenance Manual - VDMM+ Original Manual" in contrast to "VDMM Baseline Maintenance - VDMM Baseline Original"
     */
    const vdmm_plus_manual_diff_rel_diff = relativeMaintenanceDiff(vdmm_plus_manual_diff, vdmm_baseline_diff)

    /**
     * Relative Diff of "VDMM+ Maintenance Automated Quality - VDMM+ Original Automated Quality" in contrast to "VDMM Baseline Maintenance - VDMM Baseline Original"
     */
    const vdmm_plus_automated_quality_diff_rel_diff = relativeMaintenanceDiff(
        vdmm_plus_automated_diff,
        vdmm_baseline_diff
    )

    /**
     * Output
     */
    printTable<MetricsDataRelativeDiff>('From Original to Maintained (Relative to change to baseline) ', [
        vdmm_plus_manual_diff_rel_diff,
        vdmm_plus_automated_quality_diff_rel_diff,
    ])
}

type RuleData = {
    Technology: string
    Component: string
    Hosting?: string | string[]
    Quality?: number
    Comment?: string
}

type QualityData = {
    scenario: string
    expert: number
    non_expert: any
    random: number[]
    counting: number[]
    quality: number
    quality_counting: number
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

type MetricsDataAbsoluteDiff = {
    scenario: string
    models_abs_diff: number
    elements_abs_diff: number
    conditions_abs_diff: number
    technology_assignments_abs_diff: number
    lines_of_code_abs_diff: number
}

type MetricsDataRelativeDiff = {
    scenario: string
    //  models_rel_diff: number
    elements_rel_diff: number
    conditions_rel_diff: number
    technology_assignments_rel_diff: number
    lines_of_code_rel_diff: number
}

type MetricsDataOriginalDiff = {
    scenario: string

    models_abs_diff: number
    models_rel_diff: number

    elements_abs_diff: number
    elements_rel_diff: number

    conditions_rel_diff: number
    conditions_abs_diff: number

    technology_assignments_abs_diff: number
    technology_assignments_rel_diff: number

    lines_of_code_abs_diff: number
    lines_of_code_rel_diff: number
}

function originalDiff(now: MetricsData, before: MetricsData): MetricsDataOriginalDiff {
    return {
        scenario: `${now.short ?? now.scenario} - ${before.short ?? before.scenario}`,

        models_abs_diff: now.models - before.models,
        models_rel_diff: utils.roundNumber(now.models / before.models),

        elements_abs_diff: now.elements - before.elements,
        elements_rel_diff: utils.roundNumber(now.elements / before.elements),

        conditions_abs_diff: now.conditions - before.conditions,
        conditions_rel_diff: utils.roundNumber(now.conditions / before.conditions),

        technology_assignments_abs_diff: now.technology_assignments - before.technology_assignments,
        technology_assignments_rel_diff: utils.roundNumber(now.technology_assignments / before.technology_assignments),

        lines_of_code_abs_diff: now.lines_of_code - before.lines_of_code,
        lines_of_code_rel_diff: utils.roundNumber(now.lines_of_code / before.lines_of_code),
    }
}

function absoluteMaintenanceDiff(now: MetricsData, before: MetricsData): MetricsDataAbsoluteDiff {
    return {
        scenario: `${now.short ?? now.scenario} - ${before.short ?? before.scenario}`,
        models_abs_diff: now.models - before.models,
        elements_abs_diff: now.elements - before.elements,
        conditions_abs_diff: now.conditions - before.conditions,
        technology_assignments_abs_diff: now.technology_assignments - before.technology_assignments,
        lines_of_code_abs_diff: now.lines_of_code - before.lines_of_code,
    }
}

function relativeMaintenanceDiff(
    now: MetricsDataAbsoluteDiff,
    before: MetricsDataAbsoluteDiff
): MetricsDataRelativeDiff {
    return {
        scenario: `(${now.scenario}) / (${before.scenario})`,
        //        models_rel_diff: maintained.models_abs_diff / previous.models_abs_diff,
        elements_rel_diff: utils.roundNumber(now.elements_abs_diff / before.elements_abs_diff),
        conditions_rel_diff: utils.roundNumber(now.conditions_abs_diff / before.conditions_abs_diff),
        technology_assignments_rel_diff: utils.roundNumber(
            now.technology_assignments_abs_diff / before.technology_assignments_abs_diff
        ),
        lines_of_code_rel_diff: utils.roundNumber(now.lines_of_code_abs_diff / before.lines_of_code_abs_diff),
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
