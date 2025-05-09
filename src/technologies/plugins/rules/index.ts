import * as assert from '#assert'
import * as check from '#check'
import Artifact from '#graph/artifact'
import Element from '#graph/element'
import Graph from '#graph/graph'
import Node from '#graph/node'
import Technology from '#graph/technology'
import {andify} from '#graph/utils'
import {NodeType, NodeTypeMap} from '#spec/node-type'
import {TechnologyTemplateMap} from '#spec/technology-template'
import std from '#std'
import Registry from '#technologies/plugins/rules/registry'
import {ASTERISK, METADATA} from '#technologies/plugins/rules/types'
import {Match, Scenario, TechnologyPlugin, TechnologyPluginBuilder} from '#technologies/types'
import {
    constructImplementationName,
    constructRuleName,
    destructImplementationName,
    isGenerated,
    sortRules,
    toScenarios,
} from '#technologies/utils'
import * as utils from '#utils'
import {UnexpectedError} from '#utils/error'

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
        const rules = this.graph.serviceTemplate.topology_template?.variability?.qualities
        if (check.isUndefined(rules)) return []
        assert.isObject(rules, 'Rules not loaded')
        return rules.sort(sortRules)
    }

    getScenarios(filter: {technology?: string} = {}) {
        return toScenarios(this.getRules(), filter)
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

    assign(node: Node): TechnologyTemplateMap[] {
        // All scenarios
        const scenarios = this.getScenarios()

        // Early return if no scenarios
        if (utils.isEmpty(scenarios)) return []

        // Match all deployment scenarios
        const matches = scenarios.map(it => this.match(node, it)).flat(Infinity) as Match[]

        // Generate technology templates
        const maps: TechnologyTemplateMap[] = []
        for (let index = 0; index < matches.length; index++) {
            // Match
            const match = matches[index]
            const prio = this.prio(node, match.scenario.component)

            // Assessments
            let assessments = match.scenario.assessments

            // Best assessment
            if (this.graph.options.enricher.technologiesBestOnly) {
                const max = Math.max(...match.scenario.assessments.map(it => it.quality))
                const assessment = match.scenario.assessments.find(it => it.quality === max)
                assert.isDefined(assessment)
                assessments = [assessment]
            }

            // Generate technology template for each assessment
            for (const assessment of assessments) {
                // Implementation name
                const implementation = constructImplementationName({
                    type: node.getType().name,
                    rule: assessment._rule,
                })

                // Element conditions
                const conditions = match.elements.map(it => it.presenceCondition)
                conditions.forEach((it: any) => delete it._cached_element)

                // Add rule conditions
                if (check.isDefined(assessment._rule.conditions)) {
                    conditions.push(...utils.toList(assessment._rule.conditions))
                }

                // Construct technology template
                maps.push({
                    [assessment.technology]: {
                        conditions: utils.isEmpty(conditions) ? conditions : andify(conditions),
                        weight: assessment.quality,
                        prio,
                        assign: assessment._rule.assign ?? implementation,
                        scenario: match.scenario.key,
                    },
                })
            }
        }

        return maps
    }

    /**
     * Test if there is a match
     */
    test(node: Node, scenario: Scenario) {
        return utils.isPopulated(this.match(node, scenario))
    }

    /**
     * Return all matches
     */
    match(node: Node, scenario: Scenario): Match[] {
        // Must match component
        if (!node.getType().isA(scenario.component)) return []

        // Must match artifact
        let artifacts: Artifact[] = []
        if (check.isDefined(scenario.artifact)) {
            // Check for artifact in template
            artifacts = node.artifacts.filter(it => {
                assert.isDefined(scenario.artifact)
                return it.getType().isA(scenario.artifact)
            })
            const hasArtifactInTemplate = utils.isPopulated(artifacts)

            // Check for artifact in type (which are always present)
            const hasArtifactInType = this.graph.inheritance.hasArtifactDefinition(
                node.getType().name,
                scenario.artifact
            )

            // Ignore if artifact not matched
            if (!hasArtifactInTemplate && !hasArtifactInType) return []
        }

        // Must match hosting
        const hostings: Element[][] = []
        assert.isDefined(scenario.hosting)
        if (!utils.isEmpty(scenario.hosting)) {
            this.search(node, utils.copy(scenario.hosting), [], hostings)
            // Ignore if hosting not matched
            if (utils.isEmpty(hostings)) return []
        }

        // Does not require artifact and not hosting
        if (utils.isEmpty(artifacts) && utils.isEmpty(hostings))
            return [
                {
                    elements: [],
                    root: node,
                    scenario,
                },
            ]

        // Does not require artifact but hosting
        if (utils.isEmpty(artifacts) && !utils.isEmpty(hostings)) {
            return hostings.map(it => ({
                elements: it,
                root: node,
                hosting: it,
                scenario,
            }))
        }

        // Does require artifact but not hosting
        if (!utils.isEmpty(artifacts) && utils.isEmpty(hostings)) {
            return artifacts.map(it => ({
                elements: [it],
                root: node,
                artifact: it,
                scenario,
            }))
        }

        // Does require artifact and hosting
        if (!utils.isEmpty(artifacts) && !utils.isEmpty(hostings)) {
            const matches: Match[] = []
            for (const artifact of artifacts) {
                for (const hosting of hostings) {
                    matches.push({
                        elements: hosting.concat(artifact),
                        root: node,
                        artifact,
                        hosting,
                        scenario,
                    })
                }
            }
            return matches
        }

        throw new UnexpectedError()
    }

    /**
     * Scenario prio is defined by the inheritance depth between the node type and the (rule | scenario).component
     */
    private prioCache: {[key: string]: number | undefined} = {}

    prio(node: Node, target: string): number {
        const source = node.getType().name
        const key = `${source}::prio::${target}`

        if (check.isUndefined(this.prioCache[key])) {
            const types = this.graph.inheritance.collectNodeTypes(source)
            const index = types.findIndex(it => it.name === target)
            if (index === -1)
                throw new Error(
                    `Expected to find target type "${target}" in inheritance of source type "${source}" which is "${JSON.stringify(
                        types.map(it => it.name)
                    )}"`
                )
            this.prioCache[key] = index
        }

        const result = this.prioCache[key]
        assert.isDefined(result)
        return result
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
