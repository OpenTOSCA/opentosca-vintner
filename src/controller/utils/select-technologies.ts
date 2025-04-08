import * as assert from '#assert'
import * as check from '#check'
import * as files from '#files'
import Graph from '#graph/graph'
import Loader from '#graph/loader'
import std from '#std'
import {TechnologyRulePlugin} from '#technologies/plugins/rules'
import {DeploymentScenarioMatch} from '#technologies/types'
import * as utils from '#utils'

export type UtilsSelectTechnologiesOptions = {
    template: string
    output: string
}

// TODO: rest api

export default async function (options: UtilsSelectTechnologiesOptions) {
    assert.isDefined(options.template, 'Template not defined')
    assert.isDefined(options.output, 'Output not defined')

    // Template
    const template = new Loader(options.template).raw()
    const copy = await new Loader(options.template).load()
    const graph = new Graph(copy)

    // Enrich technologies
    new DeploymentTechnologyEnricher(graph).run()

    // Copy technology assignments to unchanged template
    for (const [name, map] of Object.entries(template.topology_template?.node_templates || {})) {
        const technology = graph.getNode(name).raw.technology

        if (check.isString(technology)) {
            map.technology = technology
        }
    }

    files.storeYAML(options.output, template)
}

class DeploymentTechnologyEnricher {
    protected readonly graph: Graph
    protected readonly plugin: TechnologyRulePlugin

    constructor(graph: Graph) {
        this.graph = graph
        this.plugin = new TechnologyRulePlugin(this.graph)
    }

    run() {
        for (const node of this.graph.nodes.filter(it => utils.isEmpty(it.technologies))) {
            /**
             * Step A
             */
            const assessments = this.plugin.getRules()
            const matches = assessments
                .map(it => this.plugin.match(node, it))
                .flat(Infinity) as DeploymentScenarioMatch[]
            if (utils.isEmpty(matches)) {
                std.log(`${node.Display} has no deployment scenario matches`)
                continue
            }

            /**
             * Step B
             */
            const min = Math.min(...matches.map(it => it.prio))
            const prioritized = matches.filter(it => it.prio === min)

            /**
             * Step C
             */
            const max = Math.max(...prioritized.map(it => it.rule.weight ?? 1))
            const assessment = prioritized.find(it => it.rule.weight === max)
            assert.isDefined(assessment)
            const technology = assessment.rule.technology
            node.raw.technology = technology
            std.log(`Technology "${technology}" is assigned to ${node.display}`)
        }
    }
}
