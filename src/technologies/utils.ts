export const TYPE_DELIMITER = '::'
import * as assert from '#assert'

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
