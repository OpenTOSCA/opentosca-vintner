import * as assert from '#assert'
import * as check from '#check'
import * as files from '#files'
import Element from '#graph/element'
import Graph from '#graph/graph'
import Loader from '#graph/loader'
import {hotfixBratans} from '#resolver'
import {ServiceTemplate} from '#spec/service-template'
import {IMPLEMENTATION_NAME_REGEX, isImplementation} from '#technologies/utils'
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
            options.template.map(async file => {
                const template = await new Loader(file).load()
                hotfixBratans(template)

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

                    edmm_elements: graph.elements.filter(element => element.isEDMM()).length,

                    edmm_elements_without_technologies: graph.elements
                        .filter(element => element.isEDMM())
                        .filter(element => !element.isTechnology()).length,

                    edmm_elements_conditions_manual:
                        graph.elements
                            .filter(element => element.isEDMM())
                            .reduce((sum, element) => sum + countManualConditions(element), 0) +
                        countConditionsInPreamble(template),

                    edmm_elements_conditions_generated: graph.elements
                        .filter(element => element.isEDMM())
                        .reduce((sum, element) => sum + countGeneratedConditions(element), 0),

                    loc: files.countLines(file),
                    locp: files.countNotBlankLines(file),
                }

                /**
                 * Guess technology elements based on node type names following our implementation name pattern, see {@link IMPLEMENTATION_NAME_REGEX}.
                 * Add technologies to the corresponding stats.
                 * However, we ignore edmm_elements_conditions_manual and edmm_elements_conditions_generated since we guess technologies only for EDMM and not for VDMM
                 */
                if (options.guessTechnologies) {
                    const guessed = graph.nodes.filter(node => isImplementation(node.getType().name)).length

                    stats.technologies += guessed
                    stats.vdmm_elements += guessed
                    stats.edmm_elements += guessed
                    stats.loc += guessed
                    stats.locp += guessed
                }

                return stats
            })
        )
    )
}

function countConditionsInPreamble(template: ServiceTemplate) {
    let count = 0

    const expressions = template.topology_template?.variability?.expressions ?? {}

    Object.entries(expressions).forEach(([name, expression]) => {
        if (check.isObject(expression)) {
            const [key, value] = Object.entries(expression)[0]
            if (['and', 'or'].includes(key) && check.isArray(value)) {
                count += value.length
            } else {
                count++
            }
        }
    })

    return count
}

// TODO: does not work for VariabilityGroups
// TODO: does not work for arbitrary nested conditions
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

// TODO: does not work for VariabilityGroups
// TODO: does not work for arbitrary nested conditions
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
