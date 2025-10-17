import * as assert from '#assert'
import * as check from '#check'
import Graph from '#graph/graph'
import {TopologyTemplate} from '#spec/topology-template'
import {Report} from '#technologies/types'
import {toLabel} from '#technologies/utils'
import * as utils from '#utils'

// TODO: use it
// TODO: measure it

export default class Reporter {
    private readonly graph: Graph
    private readonly topology: TopologyTemplate

    constructor(graph: Graph) {
        this.graph = graph
        this.topology = graph.serviceTemplate.topology_template || {}
    }

    run() {
        const report: Report = []

        if (check.isDefined(this.topology.node_templates)) {
            for (const node of this.graph.nodes.filter(it => it.present)) {
                // Ignore if previously had no technologies
                if (utils.isEmpty(node.technologies)) return

                // Present technology
                const technology = node.technologies.find(it => it.present)
                if (check.isUndefined(technology)) throw new Error(`${node.Display} has no present technology`)

                const scenario = technology.scenario

                if (check.isDefined(scenario)) {
                    const assessment = scenario.assessments.find(it => it.technology === technology.name)
                    assert.isDefined(assessment)

                    report.push({
                        component: node.name,
                        technology: technology.name,
                        quality: toLabel(technology.weight),
                        reason: assessment.reason,
                        scenario: scenario.key,
                    })
                } else {
                    report.push({
                        component: node.name,
                        technology: technology.name,
                        quality: toLabel(technology.weight),
                        reason: 'MANUALLY ASSIGNED',
                        scenario: 'MANUALLY ASSIGNED',
                    })
                }
            }
        }

        return report
    }
}
