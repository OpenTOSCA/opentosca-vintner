import * as assert from '#assert'
import * as check from '#check'
import {NodeType} from '#spec/node-type'
import {TechnologyRule} from '#spec/technology-template'

import {METADATA} from '#technologies/plugins/rules/types'
import {Scenario} from '#technologies/types'
import * as utils from '#utils'

export const QUALITIES_FILENAME = 'qualities.yaml'

export const GENERATION_MARK_TEXT = '# [OPENTOSCA_VINTNER_GENERATION_MARK]'

export const GENERATION_MARK_REGEX = new RegExp(
    String.raw`[\s]*#\s\[OPENTOSCA\_VINTNER\_GENERATION\_MARK\][\s\S]*`,
    'm'
)

export const GENERATION_NOTICE = `
################################################################
#
# WARNING: Do not edit! This following content is autogenerated!
#
################################################################
`.trim()

export function constructImplementationName(data: {type: string; rule: TechnologyRule}) {
    return `${data.type}~${constructRuleName(data.rule)}`
}

// TODO: also parse hosting stack by detecting reoccurring "->"
export const IMPLEMENTATION_NAME_REGEX = new RegExp(
    /(?<type>[^~]*)~(?<component>[^#]*)(#(?<artifact>[^::]*))?::(?<technology>[^@]*)(@(?<hosting>.*))?/
)

export function destructImplementationName(name: string) {
    const result = name.match(IMPLEMENTATION_NAME_REGEX)
    assert.isDefined(result)

    const data = result.groups
    assert.isDefined(data)

    const type = data['type']
    assert.isDefined(type)

    const component = data['component']
    assert.isDefined(component)

    const artifact = data['artifact']

    const technology = data['technology']
    assert.isDefined(technology)

    const hosting = data['hosting'] ? data['hosting'].split('->') : []

    return {
        type,
        component,
        artifact,
        technology,
        hosting,
    }
}

export function constructScenarioName(data: TechnologyRule) {
    return constructRuleName(data, {technology: false})
}

export function constructRuleName(data: TechnologyRule, options: {technology?: boolean} = {}) {
    options.technology = options.technology ?? true

    let output = data.component

    if (check.isDefined(data.artifact)) {
        output += '#' + data.artifact
    }

    if (options.technology) {
        output += '::' + data.technology
    }

    if (check.isDefined(data.hosting) && utils.isPopulated(data.hosting)) {
        output += '@' + data.hosting.join('->')
    }

    return output
}

export function isImplementation(type: string) {
    return IMPLEMENTATION_NAME_REGEX.test(type)
}

export function isGenerated(type: NodeType) {
    return check.isDefined(type.metadata) && type.metadata[METADATA.VINTNER_GENERATED] === 'true'
}

export function isAbstract(type: NodeType) {
    return check.isDefined(type.metadata) && type.metadata[METADATA.VINTNER_ABSTRACT] === 'true'
}

export function isIgnore(type: NodeType) {
    if (check.isUndefined(type.metadata)) return false
    return type.metadata[METADATA.VINTNER_IGNORE] === 'true'
}

export function isNormative(type: NodeType) {
    return check.isDefined(type.metadata) && type.metadata[METADATA.VINTNER_NORMATIVE] === 'true'
}

export enum QUALITY_LABEL {
    VERY_HIGH = 'very high',
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low',
    VERY_LOW = 'very low',
}

export const QUALITY_DEFAULT_WEIGHT = 1

export function toLabel(weight = QUALITY_DEFAULT_WEIGHT): QUALITY_LABEL {
    if (weight < 0) throw new Error(`Unknown quality weight "${weight}"`)

    if (weight <= 0.125) return QUALITY_LABEL.VERY_LOW
    if (weight <= 0.375) return QUALITY_LABEL.LOW
    if (weight <= 0.625) return QUALITY_LABEL.MEDIUM
    if (weight <= 0.875) return QUALITY_LABEL.HIGH
    if (weight <= 1) return QUALITY_LABEL.VERY_HIGH

    throw new Error(`Unknown quality weight "${weight}"`)
}

export function toString(weight: number): string {
    return `${toLabel(weight)} (${weight})`
}

export function toWeight(label: QUALITY_LABEL) {
    if (label === QUALITY_LABEL.VERY_HIGH) return 1
    if (label === QUALITY_LABEL.HIGH) return 0.75
    if (label === QUALITY_LABEL.MEDIUM) return 0.5
    if (label === QUALITY_LABEL.LOW) return 0.25
    if (label === QUALITY_LABEL.VERY_LOW) return 0

    throw new Error(`Unknown quality label "${label}"`)
}

export function sortRules(x: TechnologyRule, y: TechnologyRule): number {
    assert.isDefined(x.hosting)
    assert.isDefined(y.hosting)

    // Sort by component
    const c = x.component.localeCompare(y.component)
    if (c !== 0) return c

    // Sort by artifact
    let a = 0
    if (check.isDefined(x.artifact) && check.isDefined(y.artifact)) {
        a = x.artifact.localeCompare(y.artifact)
    }
    if (a !== 0) return a

    // Sort by hosting stack
    const h = x.hosting.join().localeCompare(y.hosting.join())
    if (h !== 0) return h

    // Sort by technology
    return x.component.localeCompare(y.component)
}

export function toScenarios(rules: TechnologyRule[], filter: {technology?: string} = {}): Scenario[] {
    const scenarios: Scenario[] = []

    for (const rule of rules) {
        assert.isDefined(rule.weight)
        assert.isDefined(rule.hosting)

        if (check.isDefined(filter.technology) && rule.technology !== filter.technology) continue

        const key = constructScenarioName(rule)

        const assessment = {
            technology: rule.technology,
            quality: rule.weight,
            reason: rule.reason,
            _rule: rule,
        }

        const found = scenarios.find(it => it.key === key)
        if (found) {
            found.assessments.push(assessment)
        } else {
            scenarios.push({
                key,
                component: rule.component,
                operations: rule.operations,
                artifact: rule.artifact,
                hosting: rule.hosting,
                assessments: [assessment],
            })
        }
    }

    return scenarios
}
