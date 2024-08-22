import * as check from '#check'
import {NodeType} from '#spec/node-type'
import {METADATA} from '#technologies/plugins/rules/types'
import * as utils from '#utils'

export const TECHNOLOGY_RULES_FILENAME = 'rules.yaml'

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

export type RuleData = {component: string; technology: string; artifact?: string; hosting?: string[]}

export function constructImplementationName(data: {type: string; rule: RuleData}) {
    return `${data.type}~${constructRuleName(data.rule)}`
}

export function constructRuleName(data: RuleData) {
    let output = data.component

    if (check.isDefined(data.artifact)) {
        output += '#' + data.artifact
    }

    output += '::' + data.technology

    if (check.isDefined(data.hosting) && !utils.isEmpty(data.hosting)) {
        output += '@' + data.hosting.join('->')
    }

    return output
}

export function isImplementation(type: string) {
    // TODO: replace this with proper regex match
    return type.includes('::')
}

export function isGenerated(type: NodeType) {
    return check.isDefined(type.metadata) && type.metadata[METADATA.VINTNER_GENERATED] === 'true'
}

export function isAbstract(type: NodeType) {
    return check.isDefined(type.metadata) && type.metadata[METADATA.VINTNER_ABSTRACT] === 'true'
}

export function isGenerate(type: NodeType) {
    if (check.isUndefined(type.metadata)) return true
    return type.metadata[METADATA.VINTNER_GENERATE] !== 'false'
}
