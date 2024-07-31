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
    const docker = await stats('Docker', path.join(testsDir, 'docker', 'expected.yaml'))
    docker.technology_assignments = 12
    docker.lines_of_code += 12

    /**
     * GCP (12 technologies are encoded in types)
     */
    const gcp = await stats('GCP', path.join(testsDir, 'gcp', 'expected.yaml'))
    gcp.technology_assignments = 12
    gcp.lines_of_code += 12

    /**
     * Kubernetes (12 technologies are encoded in types)
     */
    const kubernetes = await stats('Kubernetes', path.join(testsDir, 'kubernetes', 'expected.yaml'))
    kubernetes.technology_assignments = 12
    kubernetes.lines_of_code += 12

    /**
     * OS Medium (18 technologies are encoded in types)
     */
    const medium = await stats('Medium', path.join(testsDir, 'os-medium', 'expected.yaml'))
    medium.technology_assignments = 18
    medium.lines_of_code += 18

    /**
     * OS Large (18 technologies are encoded in types)
     */
    const large = await stats('Large', path.join(testsDir, 'os-large', 'expected.yaml'))
    large.technology_assignments = 18
    large.lines_of_code += 18

    /**
     * Total Variants
     */
    const variants = [docker, gcp, kubernetes, medium, large]
    const total: Data = {
        scenario: 'Total (Docker, GCP, Kubernetes, Large, Medium)',
        models: variants.length,
        elements: utils.sum(variants.map(it => it.elements)),
        conditions: utils.sum(variants.map(it => it.conditions)),
        technology_assignments: utils.sum(variants.map(it => it.technology_assignments)),
        lines_of_code: utils.sum(variants.map(it => it.lines_of_code)),
    }

    /**
     * Quality
     */
    const quality = await stats('Quality', templateFile)

    /**
     * Random (same as quality but with 3 more lines due to variability options)
     */
    const random = utils.copy(quality)
    random.scenario = 'Random'
    random.lines_of_code += 3

    /**
     * Counting (same as quality but with 4 more lines due to variability options)
     */
    const counting = utils.copy(quality)
    counting.scenario = 'Counting'
    counting.lines_of_code += 4

    /**
     * Add data
     */
    table.push(docker)
    table.push(gcp)
    table.push(kubernetes)
    table.push(large)
    table.push(medium)
    table.push(total)

    // TODO: baseline

    // TODO: manual

    table.push(random)
    table.push(counting)
    table.push(quality)

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
