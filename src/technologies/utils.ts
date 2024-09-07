import * as assert from '#assert'
import * as check from '#check'
import {NodeType} from '#spec/node-type'
import {TechnologyRule} from '#spec/technology-template'
import {METADATA} from '#technologies/plugins/rules/types'
import * as utils from '#utils'

// TODO: migrate examples
export const TECHNOLOGY_RULES_FILENAME = 'technology-rules.yaml'

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

export function constructRuleName(data: TechnologyRule, options: {technology?: boolean} = {}) {
    options.technology = options.technology ?? true

    let output = data.component

    if (check.isDefined(data.artifact)) {
        output += '#' + data.artifact
    }

    if (options.technology) {
        output += '::' + data.technology
    }

    if (check.isDefined(data.hosting) && !utils.isEmpty(data.hosting)) {
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
