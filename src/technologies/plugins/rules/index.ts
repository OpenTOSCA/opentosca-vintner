import * as assert from '#assert'
import * as check from '#check'
import Artifact from '#graph/artifact'
import Element from '#graph/element'
import Graph from '#graph/graph'
import Node from '#graph/node'
import Technology from '#graph/technology'
import {andify} from '#graph/utils'
import {NodeType, NodeTypeMap} from '#spec/node-type'
import {TechnologyRule, TechnologyTemplateMap} from '#spec/technology-template'
import std from '#std'
import Registry from '#technologies/plugins/rules/registry'
import {ASTERISK, METADATA} from '#technologies/plugins/rules/types'
import {TechnologyPlugin, TechnologyPluginBuilder} from '#technologies/types'
import {
    constructImplementationName,
    constructRuleName,
    destructImplementationName,
    isGenerated,
} from '#technologies/utils'
import * as utils from '#utils'
import {UnexpectedError} from '#utils/error'

export class TechnologyRulePluginBuilder implements TechnologyPluginBuilder {
    build(graph: Graph) {
        return new TechnologyRulePlugin(graph)
    }
}

export type DeploymentScenarioMatch = {
    elements: Element[]
    root: Node
    artifact?: Artifact
    hosting?: Element[]
    rule: TechnologyRule
    prio: number
}

export class TechnologyRulePlugin implements TechnologyPlugin {
    protected readonly graph: Graph

    constructor(graph: Graph) {
        this.graph = graph
    }

    getRules() {
        const rules = this.graph.serviceTemplate.topology_template?.variability?.qualities
        if (check.isUndefined(rules)) return []
        assert.isObject(rules, 'Rules not loaded')
        return rules
    }

    backwards() {
        return this.hasRules()
    }

    hasRules() {
        return utils.isPopulated(this.getRules())
    }

    uses(artifact: Artifact): Technology[] {
        return artifact.container.technologies.filter(it => {
            const deconstructed = destructImplementationName(it.assign)
            if (check.isUndefined(deconstructed.artifact)) return false
            return artifact.getType().isA(deconstructed.artifact)
        })
    }

    implement(name: string, type: NodeType): NodeTypeMap {
        const rules = this.getRules()
        if (utils.isEmpty(rules)) return {}

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

    /**
     * Check if a rule matches
     */
    private match(node: Node, rule: TechnologyRule): DeploymentScenarioMatch[] {
        // Must match component
        if (!node.getType().isA(rule.component)) return []

        // Must match artifact
        let artifacts: Artifact[] = []
        if (check.isDefined(rule.artifact)) {
            // Check for artifact in template
            artifacts = node.artifacts.filter(it => {
                assert.isDefined(rule.artifact)
                return it.getType().isA(rule.artifact)
            })
            const hasArtifactInTemplate = utils.isPopulated(artifacts)

            // Check for artifact in type (which are always present)
            const hasArtifactInType = this.graph.inheritance.hasArtifactDefinition(node.getType().name, rule.artifact)

            // Ignore if artifact not found
            if (!hasArtifactInTemplate && !hasArtifactInType) return []
        }

        // Must match hosting
        const hostings: Element[][] = []
        assert.isDefined(rule.hosting)
        if (!utils.isEmpty(rule.hosting)) {
            this.search(node, utils.copy(rule.hosting), [], hostings)
            if (utils.isEmpty(hostings)) return []
        }

        // Prio
        const prio = this.depth(node, rule.component)

        // Does not require artifact and not hosting
        if (utils.isEmpty(artifacts) && utils.isEmpty(hostings))
            return [
                {
                    elements: [],
                    root: node,
                    rule,
                    prio,
                },
            ]

        // Does not require artifact but hosting
        if (utils.isEmpty(artifacts) && !utils.isEmpty(hostings)) {
            return hostings.map(it => ({
                elements: it,
                root: node,
                hosting: it,
                rule,
                prio,
            }))
        }

        // Does require artifact but not hosting
        if (!utils.isEmpty(artifacts) && utils.isEmpty(hostings)) {
            return artifacts.map(it => ({
                elements: [it],
                root: node,
                artifact: it,
                rule,
                prio,
            }))
        }

        // Does require artifact and hosting
        if (!utils.isEmpty(artifacts) && !utils.isEmpty(hostings)) {
            const matches: DeploymentScenarioMatch[] = []
            for (const artifact of artifacts) {
                for (const hosting of hostings) {
                    matches.push({
                        elements: hosting.concat(artifact),
                        root: node,
                        artifact,
                        hosting,
                        rule,
                        prio,
                    })
                }
            }
            return matches
        }

        throw new UnexpectedError()
    }

    /**
     * Inheritance depth
     */
    private depth(node: Node, target: string): number {
        const source = node.getType().name
        const types = this.graph.inheritance.collectNodeTypes(source)
        const index = types.findIndex(it => it.name === target)
        if (index === -1)
            throw new Error(
                `Expected to find target type "${target}" in inheritance of source type "${source}" which is "${JSON.stringify(
                    types.map(it => it.name)
                )}"`
            )

        return index
    }

    assign(node: Node): TechnologyTemplateMap[] {
        // All rules
        const rules = this.getRules()

        // Early return if no rules
        if (utils.isEmpty(rules)) return []

        // Match all deployment scenarios
        const matches = rules.map(it => this.match(node, it)).flat(Infinity) as DeploymentScenarioMatch[]

        // Minimal inheritance depth
        const min = Math.min(...matches.map(it => it.prio))

        // Prioritize matched scenarios based on inheritance depth
        const prioritized = matches.filter(it => it.prio === min)

        // Generate topology templates
        const maps: TechnologyTemplateMap[] = []
        for (const match of prioritized) {
            // Implementation name
            const implementationName = constructImplementationName({
                type: node.getType().name,
                rule: match.rule,
            })

            // Element conditions
            const conditions = match.elements.map(it => it.presenceCondition)
            conditions.forEach((it: any) => delete it._cached_element)

            // Add rule conditions
            if (check.isDefined(match.rule.conditions)) {
                conditions.push(...utils.toList(match.rule.conditions))
            }

            // Construct technology template
            maps.push({
                [match.rule.technology]: {
                    conditions: utils.isEmpty(conditions) ? conditions : andify(conditions),
                    weight: match.rule.weight,
                    assign: match.rule.assign ?? implementationName,
                },
            })
        }

        return maps
    }

    private search(node: Node, hosting: string[], history: Element[], output: Element[][]) {
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
                const historyCopy = Array.from(history)
                historyCopy.push(relation)
                historyCopy.push(host)

                // Deep copy since every child call changes the state of hosting
                const hostingCopy = Array.from(hosting)

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
                const historyCopy = Array.from(history)
                historyCopy.push(relation)
                historyCopy.push(host)

                // Deep copy since every child call changes the state of hosting
                const hostingCopy = Array.from(hosting)

                // Recursive search
                this.search(host, hostingCopy, historyCopy, output)
            }
        }
    }
}
