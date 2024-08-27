import * as assert from '#assert'
import * as check from '#check'
import * as files from '#files'
import Element from '#graph/element'
import Graph from '#graph/graph'
import Loader from '#graph/loader'
import * as utils from '#utils'

export type TemplateStatsOptions = {
    template: string[]
    experimental?: boolean
    guessTechnologies?: boolean
}

export type TemplateStats = {
    nodes: number
    relations: number
    properties: number
    types: number
    policies: number
    groups: number
    inputs: number
    outputs: number
    artifacts: number
    imports: number
    technologies: number
    vdmm_elements: number
    edmm_elements: number
    edmm_elements_without_technologies: number
    edmm_elements_conditions_manual: number
    edmm_elements_conditions_generated: number
    loc: number
    locp: number
}

export default async function (options: TemplateStatsOptions) {
    assert.isDefined(options.template, 'Template not defined')
    assert.isTrue(options.experimental)

    options.guessTechnologies = options.guessTechnologies ?? true

    return utils.sumObjects<TemplateStats>(
        await Promise.all(
            options.template.map(async it => {
                const template = await new Loader(it).load()
                const graph = new Graph(template)

                const stats: TemplateStats = {
                    nodes: graph.nodes.length,
                    relations: graph.relations.length,
                    properties: graph.properties.length,
                    types: graph.types.length,
                    policies: graph.policies.length,
                    groups: graph.groups.length,
                    inputs: graph.inputs.length,
                    outputs: graph.outputs.length,
                    artifacts: graph.artifacts.length,
                    imports: graph.imports.length,
                    technologies: graph.technologies.length,
                    vdmm_elements: graph.elements.length,

                    edmm_elements: graph.elements.filter(e => e.isEDMM()).length,

                    edmm_elements_without_technologies: graph.elements
                        .filter(e => e.isEDMM())
                        .filter(e => !e.isTechnology()).length,

                    edmm_elements_conditions_manual: graph.elements
                        .filter(e => e.isEDMM())
                        .reduce((acc, e) => acc + countManualConditions(e), 0),

                    edmm_elements_conditions_generated: graph.elements
                        .filter(e => e.isEDMM())
                        .reduce((acc, e) => acc + countGeneratedConditions(e), 0),

                    loc: files.countLines(it),
                    locp: files.countNotBlankLines(it),
                }
                return stats
            })
        )
    )
}

function guessTechnologies(): number {
    // TODO: detect technology in type name
    // TODO: add to edmm_elements
    // TODO: breaks edmm_elements_conditions_manual/generated? no, since we guess only in EDMM and not in VDMM
    // TODO: add to loc
    // TODO: add to locp

    return 0
}

// TODO: does this work for VariabilityGroups?
// TODO: this likely does not work in a general case
function countManualConditions(element: Element) {
    let count = 0

    element.conditions.forEach(it => {
        if (!check.isObject(it)) {
            count++
        } else {
            if (!check.isTrue(it._generated) && !check.isTrue(it._bratan)) {
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

// TODO: does this work for VariabilityGroups?
// TODO: this likely does not work in a general case
function countGeneratedConditions(element: Element) {
    let count = 0

    element.conditions.forEach(it => {
        if (check.isObject(it)) {
            if (check.isTrue(it._generated) || check.isTrue(it._bratan)) {
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
