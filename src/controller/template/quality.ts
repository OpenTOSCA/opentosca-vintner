import * as assert from '#assert'
import Graph from '#graph/graph'
import Loader from '#graph/loader'
import std from '#std'
import {TechnologyRulePlugin} from '#technologies/plugins/rules'
import {toLabel} from '#technologies/utils'
import * as utils from '#utils'

export type TemplateQualityOptions = {
    template: string
    punishment?: number
    punish?: boolean
}

export default async function (options: TemplateQualityOptions) {
    assert.isDefined(options.template, 'Template not defined')
    options.punishment = options.punishment ?? 0
    options.punish = options.punish ?? true

    const template = await new Loader(options.template).load()
    const graph = new Graph(template)
    const plugin = new TechnologyRulePlugin(graph)

    /**
     * Weights
     */
    const weights: number[] = []
    let missing = 0
    let unsupported = 0
    let assigned = 0
    for (const node of graph.nodes) {
        if (utils.isEmpty(node.technologies)) {
            /**
             * Check if technology assignment is missing
             */
            const scenarios = plugin.getScenarios()
            const matches = scenarios.filter(it => plugin.test(node, it))
            if (utils.isPopulated(matches)) {
                std.log(node.name, '\t\t', options.punishment, 'NOT_ASSIGNED_ERROR')
                if (options.punish) weights.push(options.punishment)
                missing++
            } else {
                std.log(node.name)
            }

            continue
        }

        if (node.technologies.length !== 1) {
            throw new Error(`${node.Display} must not have multiple technologies assigned`)
        }

        assigned++

        /**
         * Find matches
         */
        const scenarios = plugin.getScenarios({technology: node.technologies[0].name})
        const matches = scenarios.filter(it => plugin.test(node, it))
        if (utils.isEmpty(matches)) {
            std.log(node.name, node.technologies[0].name, options.punishment, 'NOT_SUPPORTED_ERROR')
            if (options.punish) weights.push(options.punishment)
            unsupported++
            continue
        }

        /**
         * Prioritize matches
         */
        const min = Math.min(...matches.map(it => plugin.prio(node, it.component)))
        const prioritized = matches.filter(it => plugin.prio(node, it.component) === min)
        if (prioritized.length > 1) {
            throw new Error(`${node.Display} has more than one deployment scenario match with the same priority`)
        }
        const scenario = utils.first(prioritized)

        /**
         * Select the only existing assessment
         */
        if (scenario.assessments.length !== 1) {
            throw new Error(`${node.Display} has more than one deployment scenario assessment`)
        }
        const assessment = utils.first(scenario.assessments)

        std.log(node.name, assessment.technology, assessment.quality, scenario.key)
        weights.push(assessment.quality)
    }

    /**
     * Weight
     */
    const weight = utils.average(weights)

    return {
        weight,
        quality: toLabel(weight),
        missing,
        unsupported,
        assigned,
        total: assigned + unsupported + missing,
    }
}
