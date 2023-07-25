import day from '#utils/day'
import {Dayjs} from 'dayjs'
import * as utils from './utils'

export function toBoolean(element?: boolean, defaultValue = false) {
    if (isDefined(element)) return element
    return defaultValue
}

export function isTrue(element?: boolean) {
    return isDefined(element) && element === true
}

export function isFalse(element?: boolean) {
    return isDefined(element) && element === false
}

export function isUndefined(element: unknown): element is undefined | null {
    return typeof element === 'undefined' || element === null || element == null
}

export function isDefined<T>(element: T | undefined | null): element is T {
    return !isUndefined(element)
}

export function isString(element: unknown): element is string {
    return typeof element === 'string'
}

export function ensureDefined<T>(element: T | undefined | null, msg: string): asserts element is T {
    if (isUndefined(element)) throw new Error(msg)
}

export function ensureString(element: unknown): asserts element is string {
    if (!isString(element)) throw new Error(`Element "${utils.stringify(element)}" is not a string`)
}

export function ensureStringOrNumber(element: unknown): asserts element is string | number {
    if (!isString(element) && !isNumber(element))
        throw new Error(`Element "${utils.stringify(element)}" is neither a string nor a number`)
}

export function isBoolean(element: unknown): element is boolean {
    return typeof element === 'boolean'
}

export function ensureBoolean(element: unknown): asserts element is boolean {
    if (!isBoolean(element)) throw new Error(`Element "${utils.stringify(element)}" is not a boolean`)
}

export function ensureStatement(boolean: boolean, msg: string) {
    if (!boolean) throw new Error(msg)
}

export function isNumber(element: unknown): element is number {
    return typeof element === 'number'
}

export function ensureNumber(element: unknown): asserts element is number {
    if (!isNumber(element)) throw new Error(`Element "${utils.stringify(element)}" is not a number`)
}

export function ensureNumbers(element: unknown[]): asserts element is number[] {
    ensureArray(element)
    element.forEach(ensureNumber)
}

export function isArray(element: unknown): element is Array<unknown> {
    return Array.isArray(element)
}

export function ensureArray(element: unknown[]): asserts element is Array<unknown> {
    if (!isArray(element)) throw new Error(`Element "${utils.stringify(element)}" is not an array`)
}

export function isObject(element: unknown): element is object {
    return typeof element === 'object'
}

export function ensureObject(element: unknown): asserts element is object {
    if (!isObject(element)) throw new Error(`Element "${utils.stringify(element)}" is not an object`)
}

export function ensureName(name: string) {
    if (!name.match(/^[a-z-0-9.]+$/))
        throw new Error(`Name "${name}" not allowed. Only small characters, numbers, hyphens, and dots are allowed.`)
}

export function isDate(element: Dayjs): element is Dayjs {
    return day(element).isValid()
}

export function ensureDate(element: Dayjs) {
    if (!isDate(element)) throw new Error(`Element "${element}" is not a date`)
}
