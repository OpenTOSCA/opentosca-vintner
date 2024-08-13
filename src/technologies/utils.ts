import * as assert from '#assert'

export const TYPE_DELIMITER = '::'

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

export function constructType(component: string, technology: string, hosting: string[] = []) {
    return [component, technology, ...hosting].join(TYPE_DELIMITER)
}

export function destructType(type: string) {
    const [component, technology, ...hosting] = type.split(TYPE_DELIMITER)

    assert.isDefined(component)
    assert.isDefined(technology)
    assert.isDefined(hosting)

    return {component, technology, hosting}
}

export function isType(type: string) {
    return type.includes(TYPE_DELIMITER)
}
