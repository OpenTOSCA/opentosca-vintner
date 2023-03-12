import day from '#utils/day'
import {Dayjs} from 'dayjs'

export function isUndefined(element: unknown): element is undefined | null {
    return typeof element === 'undefined'
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
    if (!isString(element)) throw new Error(`Element "${JSON.stringify(element)}" is not a string`)
}

export function ensureStringOrNumber(element: unknown): asserts element is string | number {
    if (!isString(element) && !isNumber(element))
        throw new Error(`Element "${JSON.stringify(element)}" is neither a string nor a number`)
}

export function isBoolean(element: unknown): element is boolean {
    return typeof element === 'boolean'
}

export function ensureBoolean(element: unknown): asserts element is boolean {
    if (!isBoolean(element)) throw new Error(`Element "${JSON.stringify(element)}" is not a boolean`)
}

export function ensureStatement(boolean: boolean, msg: string) {
    if (!boolean) throw new Error(msg)
}

export function isNumber(element: unknown): element is number {
    return typeof element === 'number'
}

export function ensureNumber(element: unknown): asserts element is number {
    if (!isNumber(element)) throw new Error(`Element "${JSON.stringify(element)}" is not a number`)
}

export function ensureNumbers(element: unknown[]): asserts element is number[] {
    ensureArray(element)
    element.forEach(ensureNumber)
}

export function isArray(element: unknown): element is Array<unknown> {
    return Array.isArray(element)
}

export function ensureArray(element: unknown[]): asserts element is Array<unknown> {
    if (!isArray(element)) throw new Error(`Element "${JSON.stringify(element)}" is not an array`)
}

export function isObject(element: unknown): element is object {
    return typeof element === 'object'
}

export function ensureObject(element: unknown): asserts element is object {
    if (!isObject(element)) throw new Error(`Element "${JSON.stringify(element)}" is not an object`)
}

export function ensureName(name: string) {
    if (!name.match(/^[a-z-]+$/))
        throw new Error(`Name "${name}" not allowed. Only small characters and hyphens are allowed.`)
}

export function isDate(element: Dayjs): element is Dayjs {
    return day(element).isValid()
}

export function ensureDate(element: Dayjs) {
    if (!isDate(element)) throw new Error(`Element "${element}" is not a date`)
}
