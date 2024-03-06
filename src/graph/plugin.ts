import * as assert from '#assert'
import * as check from '#check'
import Graph from '#graph/graph'
import Node from '#graph/node'
import {TechnologyTemplateMap} from '#spec/technology-template'
import * as utils from '#utils'

export type TechnologyPluginBuilder = {
    build(graph: Graph): TechnologyPlugin
}

export type TechnologyPlugin = {
    assign: (node: Node) => TechnologyTemplateMap[]
}

export class TechnologyRulePluginBuilder implements TechnologyPluginBuilder {
    build(graph: Graph) {
        return new TechnologyRulePlugin(graph)
    }
}

export class TechnologyRulePlugin implements TechnologyPlugin {
    protected readonly graph: Graph

    constructor(graph: Graph) {
        this.graph = graph
    }

    getRules() {
        const rules = this.graph.serviceTemplate.topology_template?.variability?.technology_assignment_rules
        if (check.isUndefined(rules)) return rules
        assert.isObject(rules, 'Rules not loaded')
        return rules
    }

    hasRules() {
        return check.isDefined(this.getRules())
    }

    assign(node: Node): TechnologyTemplateMap[] {
        const maps: TechnologyTemplateMap[] = []

        const map = this.getRules()
        if (check.isUndefined(map)) return maps

        for (const technology of Object.keys(map)) {
            const rules = map[technology]

            for (const rule of rules) {
                if (rule.component !== node.getType().name) continue
                if (check.isDefined(rule.host)) {
                    const hosts = node.hosts.filter(it => it.getType().name === rule.host)
                    for (const host of hosts) {
                        maps.push({
                            [technology]: {
                                conditions: utils.filterNotNull([{node_presence: host.name}, rule.conditions]),
                                weight: rule.weight,
                                assign: rule.assign,
                            },
                        })
                    }
                } else {
                    maps.push({
                        [technology]: {
                            conditions: rule.conditions,
                            weight: rule.weight,
                            assign: rule.assign,
                        },
                    })
                }
            }
        }

        return maps
    }
}
