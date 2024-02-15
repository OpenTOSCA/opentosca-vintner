import * as assert from '#assert'
import * as check from '#check'
import * as files from '#files'
import Element from '#graph/element'
import Graph from '#graph/graph'
import {ServiceTemplate} from '#spec/service-template'
import * as utils from '#utils'

export type TemplateStatsOptions = {
    template: string[]
}

export type TemplateStats = {
    nodes: number
    relations: number
    properties: number
    types: number
    policies: number
    groups: number
    inputs: number
    artifacts: number
    imports: number
    technologies: number
    elements: number
    // Nodes + Relations + Properties + Artifacts + (Manual) Technologies
    nrpat: number
    manual_at_nrpat: number
    generated_at_nrpat: number
}

export default async function (options: TemplateStatsOptions) {
    assert.isDefined(options.template, 'Template not defined')

    return utils.sumObjects(
        options.template.map(it => {
            const graph = new Graph(files.loadYAML<ServiceTemplate>(it))

            const nrpa = graph.nodes.length + graph.relations.length + graph.properties.length + graph.artifacts.length

            const stats: TemplateStats = {
                nodes: graph.nodes.length,
                relations: graph.relations.length,
                properties: graph.properties.length,
                types: graph.types.length,
                policies: graph.policies.length,
                groups: graph.groups.length,
                inputs: graph.inputs.length,
                artifacts: graph.artifacts.length,
                imports: graph.imports.length,
                technologies: graph.technologies.length,
                elements: graph.elements.length,
                nrpat:
                    graph.nodes.length +
                    graph.relations.length +
                    graph.properties.length +
                    graph.artifacts.length +
                    graph.technologies.length,
                manual_at_nrpat: countManualAtNRPAT(graph),
                generated_at_nrpat: countGeneratedAtNRPAT(graph),
            }
            return stats
        })
    )
}

function countManualAtNRPAT(graph: Graph) {
    let count = 0

    graph.nodes.forEach(it => (count += countManual(it)))
    graph.relations.forEach(it => (count += countManual(it)))
    graph.properties.forEach(it => (count += countManual(it)))
    graph.artifacts.forEach(it => (count += countManual(it)))
    graph.technologies.forEach(it => (count += countManual(it)))

    return count
}

// TODO: does this work for VariabilityGroups?
// TODO: this likely does not work in a general case
function countManual(element: Element) {
    let count = 0

    element.conditions.forEach(it => {
        if (!check.isObject(it)) {
            count++
        } else {
            if (!check.isTrue(it._generated)) {
                const [key, value] = utils.firstEntry(it)
                if (['and', 'or'].includes(key) && check.isArray(value)) {
                    count += value.length
                } else {
                    count++
                }
            }
        }
    })

    return count
}

function countGeneratedAtNRPAT(graph: Graph) {
    let count = 0

    graph.nodes.forEach(it => (count += countGenerated(it)))
    graph.relations.forEach(it => (count += countGenerated(it)))
    graph.properties.forEach(it => (count += countGenerated(it)))
    graph.artifacts.forEach(it => (count += countGenerated(it)))
    graph.technologies.forEach(it => (count += countGenerated(it)))

    return count
}

// TODO: does this work for VariabilityGroups?
// TODO: this likely does not work in a general case
function countGenerated(element: Element) {
    let count = 0

    element.conditions.forEach(it => {
        if (check.isObject(it)) {
            if (check.isTrue(it._generated)) {
                const [key, value] = utils.firstEntry(it)
                if (['and', 'or'].includes(key) && check.isArray(value)) {
                    count += value.length
                } else {
                    count++
                }
            }
        }
    })

    return count
}
