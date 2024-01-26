import * as assert from '#assert'
import * as check from '#check'
import Graph from '#graph/graph'
import Node from '#graph/node'
import {andify, generatify} from '#graph/utils'
import {LogicExpression} from '#spec/variability'

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

    // TODO: consider inheritance when checking type?

    private enrichTechnologies() {
        const map = this.graph.serviceTemplate.topology_template?.variability?.technology_assignment_rules
        if (check.isUndefined(map)) return

        for (const technology of Object.keys(map)) {
            const rules = map[technology]
            assert.isArray(rules)

            for (const rule of rules) {
                assert.isString(rule.component)

                const nodes = this.graph.nodes.filter(it => it.getType().name === rule.component)
                for (const node of nodes) {
                    if (check.isString(rule.host)) {
                        const hosts = node.hosts.filter(it => it.getType().name === rule.host)
                        for (const host of hosts) {
                            this.addTechnology(node, technology, {node_presence: host.name})
                        }
                    } else {
                        this.addTechnology(node, technology, rule.conditions)
                    }
                }
            }
        }
    }

    private addTechnology(node: Node, technology: string, conditions?: LogicExpression | LogicExpression[]) {
        if (check.isUndefined(node.raw.technology)) node.raw.technology = []
        assert.isArray(node.raw.technology, `Technology of ${node.display} not normalized`)

        conditions = check.isArray(conditions) ? andify(conditions) : conditions
        conditions = check.isDefined(conditions) ? generatify(conditions) : undefined

        node.raw.technology.push({
            [`${technology}`]: {
                conditions,
            },
        })
    }
}
