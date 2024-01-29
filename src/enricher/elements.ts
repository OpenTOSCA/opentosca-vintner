import * as assert from '#assert'
import * as check from '#check'
import Graph from '#graph/graph'
import Node from '#graph/node'
import {andify, generatify, simplify} from '#graph/utils'
import {LogicExpression} from '#spec/variability'
import * as utils from '#utils'

export class ElementEnricher {
    private readonly graph: Graph

    constructor(graph: Graph) {
        this.graph = graph
    }

    run() {
        /**
         * Enrich technologies
         */
        this.enrichTechnologies()
    }

    private enrichTechnologies() {
        const map = this.graph.serviceTemplate.topology_template?.variability?.technology_assignment_rules
        if (check.isUndefined(map)) return

        for (const technology of Object.keys(map)) {
            const rules = map[technology]

            for (const rule of rules) {
                const nodes = this.graph.nodes.filter(it => it.getType().name === rule.component)

                for (const node of nodes) {
                    if (check.isDefined(rule.host)) {
                        const hosts = node.hosts.filter(it => it.getType().name === rule.host)
                        for (const host of hosts) {
                            this.addTechnology({
                                node,
                                technology,
                                conditions: utils.filterNotNull([{node_presence: host.name}, rule.conditions]),
                                weight: rule.weight,
                            })
                        }
                    } else {
                        this.addTechnology({node, technology, conditions: rule.conditions, weight: rule.weight})
                    }
                }
            }
        }
    }

    private addTechnology({
        node,
        technology,
        conditions,
        weight,
    }: {
        node: Node
        technology: string
        conditions?: LogicExpression | LogicExpression[]
        weight?: number
    }) {
        if (check.isUndefined(node.raw.technology)) node.raw.technology = []
        assert.isArray(node.raw.technology, `Technology of ${node.display} not normalized`)

        conditions = check.isArray(conditions) ? simplify(andify(conditions)) : conditions
        conditions = check.isDefined(conditions) ? generatify(conditions) : undefined

        node.raw.technology.push({[technology]: {conditions, weight}})
    }
}
