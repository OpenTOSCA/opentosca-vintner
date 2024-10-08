import * as check from '#check'
import Artifact from '#graph/artifact'
import Element from '#graph/element'
import Group from '#graph/group'
import Import from '#graph/import'
import Input from '#graph/input'
import Node from '#graph/node'
import Output from '#graph/output'
import Policy from '#graph/policy'
import Property from '#graph/property'
import Relation from '#graph/relation'
import Technology from '#graph/technology'
import Type from '#graph/type'
import * as utils from '#utils'
import {Dayjs} from 'dayjs'

export function isDefined<T>(element: T | undefined | null, msg = 'Unexpected error'): asserts element is T {
    if (!check.isDefined(element)) throw new Error(msg)
}

export function isUndefined<T>(
    element: T | undefined | null,
    msg = 'Unexpected error'
): asserts element is undefined | null {
    if (!check.isUndefined(element)) throw new Error(msg)
}

export function isString(element: unknown): asserts element is string {
    if (!check.isString(element)) throw new Error(`Element "${utils.stringify(element)}" is not a string`)
}

export function isStringOrNumber(element: unknown): asserts element is string | number {
    if (!check.isString(element) && !check.isNumber(element))
        throw new Error(`Element "${utils.stringify(element)}" is neither a string nor a number`)
}

export function isBoolean(element: unknown, msg?: string): asserts element is boolean {
    if (!check.isBoolean(element)) throw new Error(msg ?? `Element "${utils.stringify(element)}" is not a boolean`)
}

export function isTrue(element: unknown, msg?: string): asserts element is true {
    if (!check.isTrue(element)) throw new Error(msg ?? `Element "${utils.stringify(element)} is not "true"`)
}

export function isStatement(boolean: boolean, msg: string) {
    if (!boolean) throw new Error(msg)
}

export function isNumber(element: unknown, msg?: string): asserts element is number {
    if (!check.isNumber(element)) throw new Error(msg ?? `Element "${utils.stringify(element)}" is not a number`)
}

export function isNumbers(element: unknown): asserts element is number[] {
    isArray(element)
    element.forEach(it => isNumber(it))
}

export function isArray(element: unknown, msg?: string): asserts element is Array<unknown> {
    if (!check.isArray(element)) throw new Error(msg ?? `Element "${utils.stringify(element)}" is not an array`)
}

export function isObject(element: unknown, msg?: string): asserts element is object {
    if (!check.isObject(element)) throw new Error(msg ?? `Element "${utils.stringify(element)}" is not an object`)
}

export function isName(name: string) {
    if (!check.isName(name))
        throw new Error(`Name "${name}" not allowed. Only small characters, numbers, hyphens, and dots are allowed.`)
}

export function isDate(element: Dayjs) {
    if (!check.isDate(element)) throw new Error(`Element "${element}" is not a date`)
}

export function isNode(element?: Element): asserts element is Node {
    isDefined(element, 'Element not defined')
    if (!element.isNode()) throw new Error(`${element.Display} is not a node`)
}

export function isRelation(element?: Element): asserts element is Relation {
    isDefined(element, 'Element not defined')
    if (!element.isRelation()) throw new Error(`${element.Display} is not a relation`)
}

export function isPolicy(element?: Element): asserts element is Policy {
    isDefined(element, 'Element not defined')
    if (!element.isPolicy()) throw new Error(`${element.Display} is not a policy`)
}

export function isGroup(element?: Element): asserts element is Group {
    isDefined(element, 'Element not defined')
    if (!element.isGroup()) throw new Error(`${element.Display} is not a group`)
}

export function isImport(element?: Element): asserts element is Import {
    isDefined(element, 'Element not defined')
    if (!element.isImport()) throw new Error(`${element.Display} is not a import`)
}

export function isInput(element?: Element): asserts element is Input {
    isDefined(element, 'Element not defined')
    if (!element.isInput()) throw new Error(`${element.Display} is not a input`)
}

export function isOutput(element?: Element): asserts element is Output {
    isDefined(element, 'Element not defined')
    if (!element.isOutput()) throw new Error(`${element.Display} is not an output`)
}

export function isProperty(element?: Element): asserts element is Property {
    isDefined(element, 'Element not defined')
    if (!element.isProperty()) throw new Error(`${element.Display} is not a property`)
}

export function isType(element?: Element): asserts element is Type {
    isDefined(element, 'Element not defined')
    if (!element.isType()) throw new Error(`${element.Display} is not a type`)
}

export function isArtifact(element?: Element): asserts element is Artifact {
    isDefined(element, 'Element not defined')
    if (!element.isArtifact()) throw new Error(`${element.Display} is not an artifact`)
}

export function isTechnology(element?: Element): asserts element is Technology {
    isDefined(element, 'Element not defined')
    if (!element.isTechnology()) throw new Error(`${element.Display} is not a technology`)
}

export function isLinux() {
    if (!check.isLinux()) throw new Error(`Linux required`)
}
