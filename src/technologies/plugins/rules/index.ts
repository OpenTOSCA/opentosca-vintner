import * as assert from '#assert'
import * as check from '#check'
import Graph from '#graph/graph'
import Node from '#graph/node'
import {NodeType, NodeTypeMap} from '#spec/node-type'
import {TechnologyTemplateMap} from '#spec/technology-template'
import {LogicExpression} from '#spec/variability'
import std from '#std'
import Registry from '#technologies/plugins/rules/registry'
import {ASTERISK, METADATA} from '#technologies/plugins/rules/types'
import {TechnologyPlugin, TechnologyPluginBuilder} from '#technologies/types'
import {constructImplementationName, constructRuleName, isGenerated} from '#technologies/utils'
import * as utils from '#utils'

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
        const rules = this.graph.serviceTemplate.topology_template?.variability?.technology_rules
        if (check.isUndefined(rules)) return rules
        assert.isObject(rules, 'Rules not loaded')
        return rules
    }

    hasRules() {
        return check.isDefined(this.getRules())
    }

    implement(name: string, type: NodeType): NodeTypeMap {
        const rules = this.getRules()
        if (check.isUndefined(rules)) return {}

        const types: NodeTypeMap = {}

        for (const entry of rules) {
            const rule = utils.copy(entry)
            assert.isDefined(rule.hosting)

            /**
             * Note, we do not need to check for a present type here (also we cannot since artifact might be attached to the node template).
             * Such a check is conducted during assignment.
             */
            if (!this.graph.inheritance.isNodeType(name, rule.component)) continue

            const implementationName = constructImplementationName({
                type: name,
                rule,
            })

            const generatorName = constructRuleName(rule)
            const generator = Registry.get(generatorName)

            // TODO: these checks should happen after all technology plugins ran since another one might be capable of implementing this?
            if (check.isUndefined(generator)) {
                std.log(`Generator "${generatorName}" does not exist`)

                const existing = this.graph.inheritance.getNodeType(implementationName)

                if (check.isUndefined(existing)) {
                    throw new Error(`Implementation "${implementationName}" can not be generated and does not exist`)
                }

                // Ensure that implementation is not generated and, hence, not removed when writing back the newly generated implementations
                if (isGenerated(existing)) {
                    throw new Error(
                        `Implementation "${implementationName}" can not be generated but exists only generated and not manually defined`
                    )
                }

                std.log(`Implementation "${implementationName}" can not be generated but exists manually defined`)
                continue
            }

            const implementation = generator.generate(name, type)
            assert.isDefined(implementation.metadata)
            assert.isDefined(implementation.metadata[METADATA.VINTNER_GENERATED])

            if (check.isDefined(types[implementationName]))
                throw new Error(`Implementation "${implementationName}" already generated`)

            types[implementationName] = implementation
        }

        return types
    }

    assign(node: Node): TechnologyTemplateMap[] {
        const maps: TechnologyTemplateMap[] = []

        const rules = this.getRules()
        if (check.isUndefined(rules)) return maps

        for (const entry of rules) {
            const rule = utils.copy(entry)
            assert.isDefined(rule.hosting)

            if (!node.getType().isA(rule.component)) continue

            let artifactCondition: LogicExpression | undefined
            if (check.isDefined(rule.artifact)) {
                // Check for artifact in template
                const artifactsByTemplate = node.artifacts.filter(it => {
                    assert.isDefined(rule.artifact)
                    return it.getType().isA(rule.artifact)
                })
                const hasArtifactInTemplate = !utils.isEmpty(artifactsByTemplate)

                // Check for artifact in type
                const hasArtifactInType = this.graph.inheritance.hasArtifactDefinition(
                    node.getType().name,
                    rule.artifact
                )

                // Ignore if artifact not found
                if (!hasArtifactInTemplate && !hasArtifactInType) continue

                if (hasArtifactInTemplate) {
                    /**
                     * Case: hasArtifactInTemplate
                     *
                     * Add condition checking if any artifact is present (note, at max one can be present)
                     */
                    artifactCondition = {or: artifactsByTemplate.map(it => it.presenceCondition)}
                } else {
                    /**
                     * Case: hasArtifactInType
                     *
                     * Artifacts in types are always present.
                     * Hence, nothing to do.
                     */
                }
            }

            // TODO: rule.conditions

            const implementationName = constructImplementationName({
                type: node.getType().name,
                rule,
            })

            // TODO: hosting conditions should be combined by AND

            // TODO: merge then and else block
            if (rule.hosting.length !== 0) {
                const output: LogicExpression[][] = []
                this.search(node, utils.copy(rule.hosting), [], output)
                output.forEach(it => {
                    if (check.isDefined(artifactCondition)) it.push(artifactCondition)

                    maps.push({
                        [rule.technology]: {
                            conditions: it,
                            weight: rule.weight,
                            assign: rule.assign ?? implementationName,
                        },
                    })
                })
            } else {
                maps.push({
                    [rule.technology]: {
                        conditions: artifactCondition,
                        weight: rule.weight,
                        assign: rule.assign ?? implementationName,
                    },
                })
            }
        }

        return maps
    }

    private search(node: Node, hosting: string[], history: LogicExpression[], output: LogicExpression[][]) {
        const asterisk = hosting[0] === ASTERISK
        const search = asterisk ? hosting[1] : hosting[0]
        // Must be defined. To model "on any hosting" simply do not model hosting.
        assert.isDefined(search)

        for (const host of node.hosts) {
            // TODO: should assert somewhere that there is at max one hosting between the two nodes!
            const relation = node.outgoing.find(it => it.isHostedOn() && it.target === host)
            assert.isDefined(relation)

            if (host.getType().isA(search)) {
                // Deep copy since every child call changes the state of history
                const historyCopy = utils.copy(history)
                historyCopy.push({relation_presence: relation.toscaId})
                historyCopy.push({node_presence: host.name})

                // Deep copy since every child call changes the state of hosting
                const hostingCopy = utils.copy(hosting)

                // Remove * since we found next host
                if (asterisk) hostingCopy.shift()

                // Remove search
                hostingCopy.shift()

                // Done if no more hosting must be found
                if (utils.isEmpty(hostingCopy)) {
                    output.push(historyCopy)
                    continue
                }

                // Recursive search
                this.search(host, hostingCopy, historyCopy, output)
            }

            if (asterisk) {
                // Deep copy since every child call changes the state of history
                const historyCopy = utils.copy(history)
                historyCopy.push({relation_presence: relation.toscaId})
                historyCopy.push({node_presence: host.name})

                // Deep copy since every child call changes the state of hosting
                const hostingCopy = utils.copy(hosting)

                // Recursive search
                this.search(host, hostingCopy, historyCopy, output)
            }
        }
    }
}
