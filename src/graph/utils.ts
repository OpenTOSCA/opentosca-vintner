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
    if (!check.isObject(conditions)) return conditions
    if (check.isDefined(conditions.and)) {
        // Recursive
        conditions.and.forEach(it => simplify(it))

        /**
         // Remove duplicates

         // If all elements are "true", then "and" is "true"
         if (conditions.and.every(it => it === true)) return true

         // If one element is "false", then "and" is "false"
         if (conditions.and.some(it => it === false)) return false

         // If "and" is empty, then "and" is "true"
         if (conditions.and.length === 0) return true
         */

        // If only one element, return element
        if (conditions.and.length === 1) return conditions.and[0]
    }

    if (check.isDefined(conditions.or)) {
        // Recursive
        conditions.or.forEach(it => simplify(it))

        /**
         // Remove duplicates

        // If every element is "false", then "or" is "false"
        if (conditions.or.every(it => it === false)) return false

        // If one element is "true", then "or" is "true"
        if (conditions.or.some(it => it === true)) return true

        // If "or" is empty, then "or" is "false"
        if (conditions.or.length === 0) return false
         */

        // If only one element, return element
        if (conditions.or.length === 1) return conditions.or[0]
    }

    // TODO: xor
    // TODO: amo
    // TODO: implies

    return conditions
}

// TODO: better already set this when generating them?
export function generatify(expression: LogicExpression) {
    if (check.isObject(expression)) expression._generated = true
    return expression
}
