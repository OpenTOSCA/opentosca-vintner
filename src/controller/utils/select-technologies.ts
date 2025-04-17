import * as assert from '#assert'
import * as check from '#check'
import * as files from '#files'
import Graph from '#graph/graph'
import Loader from '#graph/loader'
import {NodeTemplate} from '#spec/node-template'
import std from '#std'
import {TechnologyRulePlugin} from '#technologies/plugins/rules'
import {DeploymentScenarioMatch} from '#technologies/types'
import {QUALITY_DEFAULT_WEIGHT, toLabel} from '#technologies/utils'
import * as utils from '#utils'

export type UtilsSelectTechnologiesOptions = {
    template: string
    output: string
}

export type Report = {
    node: string
    technology: string
    quality: string
    // TODO: make this required
    reason?: string
}[]

export function toReportPath(template: string) {
    if (template.endsWith('.yaml')) return template.replace('.yaml', '.report.yaml')
    return template + '.report.yaml'
}

export default async function (options: UtilsSelectTechnologiesOptions) {
    assert.isDefined(options.template, 'Template not defined')
    assert.isDefined(options.output, 'Output not defined')

    const template = new Loader(options.template).raw()
    const report: Report = []

    const copy = await new Loader(options.template).load()
    const graph = new Graph(copy)
    const plugin = new TechnologyRulePlugin(graph)

    assert.isDefined(template.topology_template?.node_templates)

    if (check.isArray(template.topology_template?.node_templates)) return

    for (const node of graph.nodes.filter(it => utils.isEmpty(it.technologies))) {
        /**
         * Step A: Find matches
         */
        const assessments = plugin.getRules()
        const matches = assessments.map(it => plugin.match(node, it)).flat(Infinity) as DeploymentScenarioMatch[]
        if (utils.isEmpty(matches)) {
            std.log(`${node.Display} has no deployment scenario matches`)
            continue
        }

        /**
         * Step B: Prioritize matches
         */
        const min = Math.min(...matches.map(it => it.prio))
        const prioritized = matches.filter(it => it.prio === min)

        /**
         * Step C: Assign technology
         */
        const max = Math.max(...prioritized.map(it => it.rule.weight ?? QUALITY_DEFAULT_WEIGHT))
        const match = prioritized.find(it => it.rule.weight === max)
        assert.isDefined(match)
        const raw = template.topology_template.node_templates[node.name] as NodeTemplate
        assert.isDefined(raw)
        raw.technology = match.rule.technology

        /**
         * Step D: Document assignment
         */
        report.push({
            node: node.name,
            technology: match.rule.technology,
            quality: toLabel(match.rule.weight),
            reason: match.rule.reason,
        })

        std.log(`Technology "${match.rule.technology}" is assigned to ${node.display}`)
    }

    files.storeYAML(options.output, template)
    files.storeYAML(toReportPath(options.output), report)

    return {
        template,
        report,
    }
}
