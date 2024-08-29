import * as assert from '#assert'
import * as check from '#check'
import Controller from '#controller'
import * as files from '#files'
import Graph from '#graph/graph'
import Loader from '#graph/loader'
import * as utils from '#utils'
import {UnexpectedError} from '#utils/error'
import path from 'path'

export type StudyTechnologyOptions = {
    application: string
    experimental: boolean
}

/**
 * Case Study for "Conditionally Using Deployment Technologies: Quality-Aware Deployment Variability Management"
 */

/**
 * Design
 *
 * Compare maintenance change relative to baseline
 *
 * Baseline is VDMM
 * Contribution is VDMM+ (VDMM extended with improvements proposed in the publication)
 *
 */

/**
 * Available applications
 *
 * - boutique
 * - industry (coming soon)
 * - shop
 */

/**
 * File structure of required models of an application
 *
 * examples/
 * - unfurl-technology---${options.application}---baseline-maintenance/
 *      - variable-service-template.yaml
 *
 * - unfurl-technology---${options.application}---baseline-original/
 *      - variable-service-template.yaml
 *
 * - unfurl-technology---${options.application}---plus-maintenance-automated/
 *     - tests/
 *          - ${edmm_original_variant_i}/
 *                  - expected.yaml
 *                  - inputs.yaml
 *                  - test.yaml
 *     - study.yaml
 *     - variable-service-template.yaml
 *
 * - unfurl-technology---${options.application}---plus-maintenance-manual/
 *    - variable-service-template.yaml
 *
 * - unfurl-technology---${options.application}---plus-original-automated/
 *     - variable-service-template.yaml
 *
 * - unfurl-technology---${options.application}---plus-original-manual/
 *     - variable-service-template.yaml
 */

/**
 * We utilize test.yaml#merge for inputs in baseline since in the old world we do not support conditional inputs:
 */

/**
 * We utilize test.yaml#merge for applying the maintenance to EDMM variants.
 * This is fine, since we do not read stats of EDMM variants after maintenance.
 */

export default async function (options: StudyTechnologyOptions) {
    assert.isDefined(options.application)
    assert.isTrue(options.experimental)

    // Expected to run this command in project root
    const examplesDir = path.join('examples')
    files.assertDirectory(examplesDir)

    const templateDir = path.join(
        examplesDir,
        `unfurl-technology---${options.application}---plus-maintenance-automated`
    )
    const templateFile = path.join(templateDir, 'variable-service-template.yaml')
    const testsDir = path.join(templateDir, 'tests')

    const config = files.loadYAML<StudyConfig>(path.join(templateDir, 'study.yaml'))
    assert.isDefined(config.study)
    assert.isDefined(config.originals)
    if (config.study !== 'technology') throw new Error(`Study "${config.study}" must be "technology"`)

    /*******************************************************************************************************************
     *
     * Technology Rules
     *
     ******************************************************************************************************************/
    /**
     * Rules
     */
    const template = await new Loader(templateFile).load()
    const graph = new Graph(template)
    const map = graph.serviceTemplate.topology_template?.variability?.technology_assignment_rules ?? {}
    if (check.isString(map)) throw new UnexpectedError()

    console.log(map)

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
                Reason: rule.reason,
                // Details: rule.details,
            })
        })
    })

    printTable<RuleData>('The technology rules of our case study. Qualities range from bad (0) to good (1).', ruleData)

    /*******************************************************************************************************************
     *
     * Initial Metrics
     *
     ******************************************************************************************************************/
    /**
     * EDMM Total Original
     */
    const edmm_variants_original: MetricsData[] = []
    for (const original of config.originals) {
        edmm_variants_original.push(await stats(`EDMM "${original}"`, path.join(testsDir, original, 'expected.yaml')))
    }
    const edmm_total_original = sumMetrics('EDMM Total', edmm_variants_original)

    /**
     * VDMM Baseline Original
     */
    const vdmm_baseline_original = await stats(
        'VDMM Baseline Original',
        path.join(
            examplesDir,
            `unfurl-technology---${options.application}---baseline-original`,
            'variable-service-template.yaml'
        )
    )

    /**
     * VDMM+ Original Manual
     */
    const vdmm_plus_original_manual = await stats(
        'VDMM+ Original Manual',
        path.join(
            examplesDir,
            `unfurl-technology---${options.application}---plus-original-manual`,
            'variable-service-template.yaml'
        )
    )

    /**
     * VDMM+ Original Automated
     */
    const vdmm_plus_original_automated = await stats(
        'VDMM+ Original Automated',
        path.join(
            examplesDir,
            `unfurl-technology---${options.application}---plus-original-automated`,
            'variable-service-template.yaml'
        )
    )

    printTable<MetricsData>('Metrics relevant when modeling the different scenarios', [
        ...edmm_variants_original,
        edmm_total_original,
        vdmm_baseline_original,
        vdmm_plus_original_manual,
        vdmm_plus_original_automated,
    ])

    /*******************************************************************************************************************
     *
     * Absolute diff of the Original Models
     *
     ******************************************************************************************************************/

    printTable<MetricsDataAbsoluteDiff>('Absolute diff when modeling the different original scenarios', [
        /**
         * Absolute diff of VDMM Baseline Original to EDMM Total
         */
        absoluteOriginalDiff(vdmm_baseline_original, edmm_total_original),

        /**
         * Absolute diff of VDMM+ Original Manual to VDMM Baseline Original
         */
        absoluteOriginalDiff(vdmm_plus_original_manual, vdmm_baseline_original),

        /**
         * Absolute diff of VDMM+ Original Automated to VDMM Baseline Original
         */
        absoluteOriginalDiff(vdmm_plus_original_automated, vdmm_baseline_original),
    ])

    /*******************************************************************************************************************
     *
     * Relative diff of the Original Models
     *
     ******************************************************************************************************************/

    printTable<MetricsDataRelativeDiff>('Relative diff when modeling the different original scenarios', [
        /**
         * Relative diff of VDMM Baseline Original to EDMM Total
         */
        relativeOriginalDiff(vdmm_baseline_original, edmm_total_original),

        /**
         * Relative diff of VDMM+ Original Manual to VDMM Baseline Original
         */
        relativeOriginalDiff(vdmm_plus_original_manual, vdmm_baseline_original),

        /**
         * Relative diff of VDMM+ Original Automated to VDMM Baseline Original
         */
        relativeOriginalDiff(vdmm_plus_original_automated, vdmm_baseline_original),
    ])

    /*******************************************************************************************************************
     *
     * Qualities
     *
     ******************************************************************************************************************/

    const qualityData: QualityData[] = []
    for (const original of config.originals) {
        const inputs = path.join(testsDir, original, 'inputs.yaml')

        const quality = await Controller.template.quality({
            template: templateFile,
            experimental: true,
            inputs,
        })

        qualityData.push({
            scenario: original,
            expert: quality.max_weight,
            non_expert: [quality.min_weight, quality.max_weight],
            random: [quality.min_weight, quality.max_weight],
            counting: [quality.min_count.min, quality.min_count.max],
            quality: quality.max_weight,
            quality_counting: quality.max_weight_min_count,
        })
    }

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
     * VDMM Baseline Maintenance
     */
    const vdmm_baseline_maintenance = await stats(
        'VDMM Baseline Maintenance',
        path.join(
            examplesDir,
            `unfurl-technology---${options.application}---baseline-maintenance`,
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
            `unfurl-technology---${options.application}---plus-maintenance-manual`,
            'variable-service-template.yaml'
        )
    )

    /**
     * VDMM+ Maintenance Automated
     */
    const vdmm_plus_maintenance_automated = await stats('VDMM+ Maintenance Automated', templateFile)

    printTable<MetricsData>('Metrics relevant when modeling the maintenance scenario of our case study', [
        vdmm_baseline_maintenance,
        vdmm_plus_maintenance_manual,
        vdmm_plus_maintenance_automated,
    ])

    /*******************************************************************************************************************
     *
     * Absolute Diff of the Maintenance
     *
     ******************************************************************************************************************/

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
        vdmm_plus_maintenance_automated,
        vdmm_plus_original_automated
    )

    printTable<MetricsDataAbsoluteDiff>('Absolute diff from original to maintained', [
        vdmm_baseline_diff,
        vdmm_plus_manual_diff,
        vdmm_plus_automated_diff,
    ])

    /*******************************************************************************************************************
     *
     * Relative Diff of the Absolute Diff of the Maintenance
     *
     ******************************************************************************************************************/
    printTable<MetricsDataRelativeDiff>('Relative diff from the absolute diff from original to maintained', [
        /**
         * Relative Diff of "VDMM+ Maintenance Manual - VDMM+ Original Manual" in contrast to "VDMM Baseline Maintenance - VDMM Baseline Original"
         */
        relativeMaintenanceDiff(vdmm_plus_manual_diff, vdmm_baseline_diff),

        /**
         * Relative Diff of "VDMM+ Maintenance Automated - VDMM+ Original Automated" in contrast to "VDMM Baseline Maintenance - VDMM Baseline Original"
         */
        relativeMaintenanceDiff(vdmm_plus_automated_diff, vdmm_baseline_diff),
    ])
}

type StudyConfig = {
    study: string
    originals: string[]
}

type RuleData = {
    Technology: string
    Component: string
    Hosting?: string | string[]
    Quality?: number
    Reason?: string
    Details?: string
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
    models_rel_diff: number
    elements_rel_diff: number
    conditions_rel_diff: number
    technology_assignments_rel_diff: number
    lines_of_code_rel_diff: number
}

function absoluteOriginalDiff(now: MetricsData, before: MetricsData): MetricsDataAbsoluteDiff {
    return {
        scenario: `${now.short ?? now.scenario} - ${before.short ?? before.scenario}`,
        models_abs_diff: now.models - before.models,
        elements_abs_diff: now.elements - before.elements,
        conditions_abs_diff: now.conditions - before.conditions,
        technology_assignments_abs_diff: now.technology_assignments - before.technology_assignments,
        lines_of_code_abs_diff: now.lines_of_code - before.lines_of_code,
    }
}

function relativeOriginalDiff(now: MetricsData, before: MetricsData): MetricsDataRelativeDiff {
    return {
        scenario: `${now.short ?? now.scenario} / ${before.short ?? before.scenario}`,
        models_rel_diff: utils.roundNumber(now.models / before.models),
        elements_rel_diff: utils.roundNumber(now.elements / before.elements),
        conditions_rel_diff: utils.roundNumber(now.conditions / before.conditions),
        technology_assignments_rel_diff: utils.roundNumber(now.technology_assignments / before.technology_assignments),
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
        // Catch 0/0 in then block
        models_rel_diff:
            now.models_abs_diff === before.models_abs_diff ? 1 : now.models_abs_diff / before.models_abs_diff,
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
        scenario,
        models: variants.length,
        elements: utils.sum(variants.map(it => it.elements)),
        conditions: utils.sum(variants.map(it => it.conditions)),
        technology_assignments: utils.sum(variants.map(it => it.technology_assignments)),
        lines_of_code: utils.sum(variants.map(it => it.lines_of_code)),
    }
}

async function stats(scenario: string, file: string): Promise<MetricsData> {
    const data = await Controller.template.stats({template: [file], experimental: true, guessTechnologies: true})
    return {
        scenario,
        models: 1,
        elements: data.edmm_elements_without_technologies,
        conditions: data.edmm_elements_conditions_manual,
        technology_assignments: data.technologies,
        lines_of_code: data.loc,
    }
}

// TODO: print also latex
function printTable<T>(caption: string, data: T[]) {
    console.log()
    console.log(caption)
    console.table(data)
}
