import * as assert from '#assert'
import * as check from '#check'
import * as files from '#files'
import {PROFILES_DIR} from '#files'
import Graph from '#graph/graph'
import {NormativeTypes} from '#normative'
import {ServiceTemplate} from '#spec/service-template'
import Registry from '#technologies/plugins/rules/registry'
import * as utils from '#utils'
import * as _ from 'lodash'
import * as console from 'node:console'
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
            const hosting = utils.copy(options.hosting)
            let host = hosting.shift()
            let depth = 0

            // TODO: handle asterisk in options.hosting?
            // TODO: handle asterisk in rule.hosting
            while (check.isDefined(host)) {
                const question = rule.hosting[depth]
                if (check.isUndefined(question)) {
                    console.log('did not find', {depth}, rule.hosting)
                    return false
                }
                if (!graph.inheritance.isNodeType(host, question)) {
                    console.log('does not match', {host, question})
                    return false
                }
                console.log('does match', {host, question})

                host = hosting.shift()
                depth++
            }

            return true
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
