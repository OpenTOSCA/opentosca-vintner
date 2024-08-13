import * as assert from '#assert'
import * as check from '#check'
import Graph from '#graph/graph'
import Node from '#graph/node'
import {TechnologyTemplateMap} from '#spec/technology-template'
import {LogicExpression} from '#spec/variability'
import {constructType} from '#technologies/utils'
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
            const rules = utils.copy(map[technology])

            for (const rule of rules) {
                assert.isArray(rule.hosting)

                if (!node.isA(rule.component)) continue

                // TODO: merge then and else block
                if (rule.hosting.length !== 0) {
                    const output: LogicExpression[][] = []
                    this.search(node, utils.copy(rule.hosting), [], output)
                    output.forEach(it => {
                        assert.isArray(rule.hosting)

                        maps.push({
                            [technology]: {
                                conditions: it,
                                weight: rule.weight,
                                assign: rule.assign ?? constructType(node.getType().name, technology, rule.hosting),
                            },
                        })
                    })
                } else {
                    maps.push({
                        [technology]: {
                            conditions: rule.conditions,
                            weight: rule.weight,
                            assign: rule.assign ?? constructType(node.getType().name, technology, rule.hosting),
                        },
                    })
                }
            }
        }

        return maps
    }

    private search(node: Node, hosting: string[], history: LogicExpression[], output: LogicExpression[][]) {
        // Searching for next hosting
        const search = hosting.shift()
        // Must be defined since else we would have aborted in the parent call
        assert.isDefined(search)

        // Conditional recursive breadth-first search
        const hosts = node.hosts.filter(it => it.isA(search))
        for (const host of hosts) {
            // Deep copy since every child call changes the state of history
            const historyCopy = utils.copy(history)
            historyCopy.push({node_presence: host.name})

            // Done if no more hosting must be found
            if (utils.isEmpty(hosting)) {
                output.push(historyCopy)
                continue
            }

            // Deep copy since every child call changes the state of hosting
            const hostingCopy = utils.copy(hosting)

            // Recursive search
            this.search(host, hostingCopy, historyCopy, output)
        }
    }
}
