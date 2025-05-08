import * as assert from '#assert'
import * as check from '#check'
import * as files from '#files'
import Graph from '#graph/graph'
import Loader from '#graph/loader'
import {NodeTemplate} from '#spec/node-template'
import {TOSCA_DEFINITIONS_VERSION} from '#spec/service-template'
import std from '#std'
import {TechnologyRulePlugin} from '#technologies/plugins/rules'
import {Report} from '#technologies/types'
import {toLabel} from '#technologies/utils'
import * as utils from '#utils'

export type TemplateAssignOptions = {
    template: string
    output: string
}

export function toReportPath(template: string) {
    if (template.endsWith('.yaml')) return template.replace('.yaml', '.report.yaml')
    return template + '.report.yaml'
}

export default async function (options: TemplateAssignOptions) {
    assert.isDefined(options.template, 'Template not defined')
    assert.isDefined(options.output, 'Output not defined')

    const template = new Loader(options.template).raw()
    if (template.tosca_definitions_version !== TOSCA_DEFINITIONS_VERSION.TOSCA_SIMPLE_YAML_1_3) {
        throw new Error(`TOSCA Simple Yaml 1.3 expected`)
    }

    assert.isDefined(template.topology_template?.node_templates)
    if (check.isArray(template.topology_template.node_templates)) {
        throw new Error('Lists for node templates are not expected since this enriches a TOSCA Light model')
    }

    const report: Report = []

    const copy = await new Loader(options.template).load()
    const graph = new Graph(copy)
    const plugin = new TechnologyRulePlugin(graph)

    const scenarios = plugin.getScenarios()

    for (const node of graph.nodes.filter(it => utils.isEmpty(it.technologies))) {
        /**
         * Find matches
         */
        const matches = scenarios.filter(it => plugin.test(node, it))
        if (utils.isEmpty(matches)) {
            std.log(`${node.Display} has no deployment scenario matches`)
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
         * Select technology
         */
        const max = Math.max(...scenario.assessments.map(it => it.quality))
        const assessment = scenario.assessments.find(it => it.quality === max)
        assert.isDefined(assessment)

        /**
         * Assign technology
         */
        const raw = template.topology_template.node_templates[node.name] as NodeTemplate
        assert.isDefined(raw)
        raw.technology = assessment.technology

        /**
         * Document assignment
         */
        report.push({
            component: node.name,
            technology: assessment.technology,
            quality: toLabel(assessment.quality),
            reason: assessment.reason,
        })

        std.log(`Technology "${assessment.technology}" is assigned to ${node.display}`)
    }

    files.storeYAML(options.output, template)
    files.storeYAML(toReportPath(options.output), report)

    return {
        template,
        report,
    }
}
