import * as assert from '#assert'
import * as check from '#check'
import Graph from '#graph/graph'
import Node from '#graph/node'
import {andify} from '#graph/utils'
import {TechnologyTemplate, TechnologyTemplateMap} from '#spec/technology-template'
import {LogicExpression} from '#spec/variability'
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

            const tmp: TechnologyTemplate[] = []

            for (const rule of rules) {
                if (rule.component !== node.getType().name) continue
                if (check.isDefined(rule.hosting)) {
                    assert.isArray(rule.hosting)
                    const output: LogicExpression[][] = []
                    this.search(node, rule.hosting, [], output)
                    output.forEach(it => {
                        tmp.push({
                            conditions: it,
                            weight: rule.weight,
                            assign: rule.assign,
                        })
                    })
                } else {
                    tmp.push({
                        // TODO: not supported
                        // conditions: rule.conditions,
                        weight: rule.weight,
                        assign: rule.assign,
                    })
                }
            }

            // TODO: must group by weights ...

            const groups = utils.groupBy(tmp, it => it.weight!)
            for (const group of Object.values(groups)) {
                maps.push({
                    [technology]: {
                        conditions: {
                            or: group.map(it => {
                                if (check.isUndefined(it.conditions)) return true
                                assert.isArray(it.conditions)
                                return andify(it.conditions)
                            }),
                        },
                        weight: group[0].weight!,
                    },
                })
            }
            // TODO: assign not supported ...
        }

        return maps
    }

    private search(node: Node, hosting: string[], history: LogicExpression[], output: LogicExpression[][]) {
        // Searching for next hosting
        const search = hosting.shift()
        // Must be defined since else we would have aborted in the parent call
        assert.isDefined(search)

        // Conditional recursive breadth-first search
        const hosts = node.hosts.filter(it => it.getType().name === search)
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
