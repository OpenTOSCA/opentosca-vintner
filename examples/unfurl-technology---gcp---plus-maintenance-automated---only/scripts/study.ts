import * as assert from '#assert'
import * as check from '#check'
import controller from '#controller'
import * as files from '#files'
import * as utils from '#utils'
import path from 'path'
import Graph from '../../../src/graph/graph'
import Loader from '../../../src/graph/loader'
import {UnexpectedError} from '../../../src/utils/error'

const templateDir = path.join('..')
const templateFile = path.join(templateDir, 'variable-service-template.yaml')

const testsDir = path.join(templateDir, 'tests')

async function main() {
    /**
     * Graph
     */
    const template = await new Loader(templateFile).load()
    const graph = new Graph(template)

    /**
     * Technology Rules
     */
    await technologyRules(graph)

    /**
     * Metrics
     */
    await metrics()

    /**
     * Qualities
     */
    await qualities()

    /**
     * Maintenance
     */
    await maintenance()
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

async function metrics() {
    /**
     * Stats
     */
    async function stats(scenario: string, file: string) {
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

    /**
     * Table
     */
    type Data = {
        scenario: string
        models: number
        elements: number
        conditions: number
        technology_assignments: number
        lines_of_code: number
    }
    const table: Data[] = []

    /**
     * Docker (12 technologies are encoded in types)
     */
    const edmm_docker = await stats('EDMM Docker', path.join(testsDir, 'docker', 'expected.yaml'))
    edmm_docker.technology_assignments = 12
    edmm_docker.lines_of_code += 12

    /**
     * GCP (12 technologies are encoded in types)
     */
    const edmm_gcp = await stats('EDMM GCP', path.join(testsDir, 'gcp', 'expected.yaml'))
    edmm_gcp.technology_assignments = 12
    edmm_gcp.lines_of_code += 12

    /**
     * Kubernetes (12 technologies are encoded in types)
     */
    const edmm_kubernetes = await stats('EDMM Kubernetes', path.join(testsDir, 'kubernetes', 'expected.yaml'))
    edmm_kubernetes.technology_assignments = 12
    edmm_kubernetes.lines_of_code += 12

    /**
     * OS Medium (18 technologies are encoded in types)
     */
    const edmm_os_medium = await stats('EDMM OS Medium', path.join(testsDir, 'os-medium', 'expected.yaml'))
    edmm_os_medium.technology_assignments = 18
    edmm_os_medium.lines_of_code += 18

    /**
     * OS Large (18 technologies are encoded in types)
     */
    const edmm_os_large = await stats('EDMM OS Large', path.join(testsDir, 'os-large', 'expected.yaml'))
    edmm_os_large.technology_assignments = 18
    edmm_os_large.lines_of_code += 18

    /**
     * Total Variants
     */
    const edmm_variants = [edmm_docker, edmm_gcp, edmm_kubernetes, edmm_os_medium, edmm_os_large]
    const edmm_total: Data = {
        scenario: 'EDMM Total (EMM Docker, EDMM GCP, EDMM Kubernetes, EDMM OS Large, EDMM OS Medium)',
        models: edmm_variants.length,
        elements: utils.sum(edmm_variants.map(it => it.elements)),
        conditions: utils.sum(edmm_variants.map(it => it.conditions)),
        technology_assignments: utils.sum(edmm_variants.map(it => it.technology_assignments)),
        lines_of_code: utils.sum(edmm_variants.map(it => it.lines_of_code)),
    }

    /**
     * Quality
     */
    const vdmm_plus_quality = await stats('VDMM+ Quality ', templateFile)

    /**
     * Random (same as quality but with 3 more lines due to variability options)
     */
    const vdmm_plus_random = utils.copy(vdmm_plus_quality)
    vdmm_plus_random.scenario = 'VDMM+ Random'
    vdmm_plus_random.lines_of_code += 3

    /**
     * Counting (same as quality but with 4 more lines due to variability options)
     */
    const vdmm_plus_counting = utils.copy(vdmm_plus_quality)
    vdmm_plus_counting.scenario = 'VDMM+ Counting'
    vdmm_plus_counting.lines_of_code += 4

    /**
     * Add data
     */
    table.push(edmm_docker)
    table.push(edmm_gcp)
    table.push(edmm_kubernetes)
    table.push(edmm_os_large)
    table.push(edmm_os_medium)
    table.push(edmm_total)

    // TODO: baseline

    // TODO: manual

    table.push(vdmm_plus_random)
    table.push(vdmm_plus_counting)
    table.push(vdmm_plus_quality)

    /**
     * Output
     */
    console.log()
    console.log('Metrics relevant when modeling the different scenarios')
    console.table(table)
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

async function maintenance() {
    // TODO: maintenance
}

main()
