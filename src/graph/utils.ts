import * as check from '#check'
import Element from '#graph/element'
import {LogicExpression} from '#spec/variability'

export function bratify(bratans: Element[]) {
    return {
        not: {
            or: bratans.map(it => it.presenceCondition),
        },
    }
}

export function andify(conditions: LogicExpression[]) {
    return {and: conditions}
}

export function simplify(conditions: LogicExpression) {
    // TODO: do this recursively
    // TODO: extend this for more cases, e.g., or, xor ...

    if (!check.isObject(conditions)) return conditions
    if (check.isDefined(conditions.and)) {
        // TODO: required that "_generated: true" can be added to "true"
        /**
        if (conditions.and.every(it => it === true)) {
            return true
        }
        */

        // TODO: required that "_generated: true" can be added to "true"
        /**
        if (conditions.and.length === 0) {
            return true
        }
        */

        if (conditions.and.length === 1) {
            return conditions.and[0]
        }
    }
    return conditions
}

// TODO: better already set this when generating them?
export function generatify(expression: LogicExpression) {
    if (check.isObject(expression)) expression._generated = true
    return expression
}
