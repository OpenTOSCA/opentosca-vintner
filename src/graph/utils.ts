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

// TODO: better already set this when generating them?
export function generatify(expression: LogicExpression) {
    if (check.isObject(expression)) expression._generated = true
    return expression
}
