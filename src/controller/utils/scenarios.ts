import * as assert from '#assert'
import * as check from '#check'
import * as files from '#files'
import {PROFILES_DIR} from '#files'
import Graph from '#graph/graph'
import {NormativeTypes} from '#normative'
import {ServiceTemplate} from '#spec/service-template'
import Registry from '#technologies/plugins/rules/registry'
import {ASTERISK} from '#technologies/plugins/rules/types'
import * as utils from '#utils'
import * as _ from 'lodash'
import path from 'path'

export type ScenariosOptions = {
    component?: string
    technology?: string
    artifact?: string | boolean
    hosting?: string[] | boolean
    quality?: number
    format?: string
}

export default async function (options: ScenariosOptions) {
    /**
     * Replace 'asterisk' with '*' due to parsing problems
     */
    options.hosting = check.isArray(options.hosting)
        ? options.hosting.map(hosting => (hosting === 'asterisk' ? ASTERISK : hosting))
        : options.hosting

    /**
     * Graph
     */
    const normative = NormativeTypes()
    const types: ServiceTemplate = _.merge(
        files.loadYAML<ServiceTemplate>(path.join(PROFILES_DIR, 'tosca', 'tosca-simple-profile.yaml')),
        normative.core.template,
        normative.extended.template
    )
    const graph = new Graph(types)

    /**
     * Rules
     */
    let rules = Registry.rules

    /**
     * Filter for component
     */
    if (check.isDefined(options.component)) {
        rules = rules.filter(rule => {
            assert.isDefined(options.component)
            return graph.inheritance.isNodeType(options.component, rule.component)
        })
    }

    /**
     * Filter for technology
     */
    if (check.isDefined(options.technology)) {
        rules = rules.filter(rule => rule.technology === options.technology)
    }

    /**
     * Filter for artifact
     */
    if (check.isDefined(options.artifact)) {
        rules = rules.filter(rule => {
            if (check.isTrue(options.artifact)) return check.isDefined(rule.artifact)
            if (check.isFalse(options.artifact)) return check.isUndefined(rule.artifact)

            if (check.isUndefined(rule.artifact)) return false

            assert.isString(options.artifact)
            return graph.inheritance.isArtifactType(options.artifact, rule.artifact)
        })
    }

    /**
     * Filter for hosting
     */
    if (check.isDefined(options.hosting)) {
        rules = rules.filter(rule => {
            assert.isDefined(rule.hosting)

            if (check.isTrue(options.hosting)) return !utils.isEmpty(rule.hosting)
            if (check.isFalse(options.hosting)) return utils.isEmpty(rule.hosting)

            assert.isArray(options.hosting)
            return matches(graph, utils.copy(options.hosting), utils.copy(rule.hosting))
        })
    }

    /**
     * Filter for quality
     */
    if (check.isDefined(options.quality)) {
        rules = rules.filter(rule => {
            assert.isDefined(options.quality)
            assert.isDefined(rule.weight)
            return rule.weight >= options.quality
        })
    }

    /**
     * Result
     */
    options.format = options.format ?? 'yaml'
    return files.toFormat(rules, options.format)
}

function matches(graph: Graph, input: string[], hosting: string[]): boolean {
    const asterisk = hosting[0] === ASTERISK
    const question = asterisk ? hosting[1] : hosting[0]
    // Must be defined. To model "on any hosting" simply do not model hosting.
    assert.isDefined(question)

    const is = input.shift()

    // Accept that user provided hosting is shorter than rule
    if (check.isUndefined(is)) return true

    if (asterisk) return matches(graph, utils.copy(input), utils.copy(hosting))

    if (graph.inheritance.isNodeType(is, question)) {
        const hostingCopy = utils.copy(hosting)

        if (asterisk) hostingCopy.shift()
        hostingCopy.shift()

        if (utils.isEmpty(hostingCopy)) return true

        return matches(graph, utils.copy(input), hostingCopy)
    }

    return false
}
