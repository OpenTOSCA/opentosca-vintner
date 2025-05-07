import * as assert from '#assert'
import Graph from '#graph/graph'
import Loader from '#graph/loader'
import std from '#std'
import {TechnologyRulePlugin} from '#technologies/plugins/rules'
import {toLabel} from '#technologies/utils'
import * as utils from '#utils'

export type TemplateQualityOptions = {
    template: string
}

export default async function (options: TemplateQualityOptions) {
    assert.isDefined(options.template, 'Template not defined')

    const template = await new Loader(options.template).load()
    const graph = new Graph(template)
    const plugin = new TechnologyRulePlugin(graph)

    /**
     * Weights
     */
    const weights: number[] = []
    // TODO: detect and increment missing, e.g., check if scenario would exist
    const missing = 0
    let unsupported = 0
    for (const node of graph.nodes) {
        if (utils.isEmpty(node.technologies)) {
            std.log(node.name)
            continue
        }

        if (node.technologies.length !== 1) {
            throw new Error(`${node.Display} must not have multiple technologies assigned`)
        }

        /**
         * Find matches
         */
        const scenarios = plugin.getScenarios({technology: node.technologies[0].name})
        const matches = scenarios.filter(it => plugin.test(node, it))
        if (utils.isEmpty(matches)) {
            // TODO: --disable-punish
            // TODO: --punishment LOW
            const punishment = 0
            weights.push(punishment)
            std.log(node.name, node.technologies[0].name, punishment, 'NOT_SUPPORTED_ERROR')
            unsupported++
            // throw new Error(`${node.Display} has no deployment scenario matches`)
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
    }
}
