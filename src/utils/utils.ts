import * as check from '#check'
import day from '#utils/day'
import process from 'process'

export function mapIsEmpty<K, V>(map: Map<K, V>) {
    return map.size === 0
}

export function mapSome<K, V>(map: Map<K, V>, fn: (value: V) => boolean) {
    for (const [key, value] of map) {
        if (fn(value)) return true
    }
    return false
}

export function groupBy<T>(elements: T[], by: (element: T) => string) {
    return elements.reduce<{[name: string]: T[]}>((map, element) => {
        const id = by(element)
        if (check.isUndefined(map[id])) map[id] = []
        map[id].push(element)
        return map
    }, {})
}

export function toList<T>(data: T | T[] | undefined): T[] {
    if (check.isUndefined(data)) return []
    if (Array.isArray(data)) return data
    return filterNotNull([data])
}

export function firstValue<V>(map: {[key: string]: V}): V {
    return Object.values(map).values().next().value
}

export function firstKey<V>(map: {[key: string]: V}): string {
    return Object.keys(map).values().next().value
}

export function firstEntry<V>(map: {[key: string]: V}): [string, V] {
    return Object.entries(map)[0]
}

export function isEmpty(obj: any) {
    if (check.isUndefined(obj)) return true
    if (check.isArray(obj)) return obj.length === 0
    if (check.isString(obj)) return obj.length === 0
    if (check.isObject(obj)) return Object.keys(obj).length === 0
    throw new Error(`Cannot check if object ${pretty(obj)} is empty`)
}

export function first<T>(array: T[]) {
    return array[0]
}

export function last<T>(array: T[]) {
    return array[array.length - 1]
}

export function listDelete<T>(list?: Array<T>, indexes?: Array<number>) {
    if (check.isUndefined(list) || check.isUndefined(indexes)) return
    indexes.sort()
    while (indexes.length) {
        const index = indexes.pop()
        if (check.isUndefined(index)) return
        list.splice(index, 1)
    }
}

export function copy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)) as T
}

export function pretty(obj: any) {
    return JSON.stringify(obj, null, 4)
}

export function stringify(obj: any) {
    return JSON.stringify(obj)
}

export function joinNotNull(array: (string | undefined)[], separator = ' ') {
    return filterNotNull(array).join(separator)
}

export function filterNotNull<T>(array: any[]): T[] {
    return array.filter(x => x !== undefined && x !== null)
}

export function prettyBytes(bytes?: number) {
    if (bytes === undefined) return
    const kb = bytes / 1000
    const mb = kb / 1000
    return kb > 1000 ? `${prettyNumber(mb)} mb` : `${prettyNumber(Math.round(kb))} kb`
}

export function prettyMilliseconds(ms?: number) {
    if (ms === undefined) return
    const s = ms / 1000
    return ms > 1000 ? `${s.toFixed(3)} s` : `${ms.toFixed(3)} ms`
}

export function prettyNumber(number?: number) {
    if (number === undefined) return
    if (Number.isInteger(number)) return number.toLocaleString('en')
    return number.toLocaleString('en', {maximumFractionDigits: 3, minimumFractionDigits: 3})
}

export function roundNumber(number: number, digits = 2) {
    return Number(number.toFixed(digits))
}

export function getMedianFromSorted(array: number[]) {
    const mid = Math.floor(array.length / 2)
    return array.length % 2 ? array[mid] : (array[mid] + array[mid - 1]) / 2
}

export function toBoolean(data: string | boolean) {
    return data === 'true' || data === true
}

export function hrtime2ms(data: [number, number]) {
    return (data[0] * 1000000000 + data[1]) / 1000000
}

export function normalizeString(value: string) {
    return value.toLowerCase().replaceAll(' ', '_')
}

export function now() {
    return day().valueOf()
}

export function weekday() {
    return day().format('dddd').toLowerCase()
}

export async function sleep(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export function toFixed(value: number) {
    return Number(value.toFixed(2))
}

export function toFirstUpperCase(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1)
}

export function sumObjects<T>(objects: {[key: string]: number}[]): T {
    return objects.reduce((a, b) => {
        for (const key in b) {
            // eslint-disable-next-line no-prototype-builtins
            if (b.hasOwnProperty(key)) a[key] = (a[key] || 0) + b[key]
        }
        return a
    }, {}) as T
}

export function looseParse(value: any) {
    try {
        return JSON.parse(value)
    } catch (e) {
        return value
    }
}

export function getPrefixedEnv(prefix: string) {
    return Object.entries(process.env).reduce<{[key: string]: any}>((acc, [key, value]) => {
        if (!check.isDefined(value)) return acc
        if (!key.startsWith(prefix)) return acc

        const name = key.slice(prefix.length).toLowerCase()
        const parsed = looseParse(value)

        acc[name] = parsed
        return acc
    }, {})
}

export function sort(unordered: {[key: string]: boolean}) {
    return Object.keys(unordered)
        .sort()
        .reduce<{[key: string]: boolean}>((obj, key) => {
            obj[key] = unordered[key]
            return obj
        }, {})
}

export function filter(unfiltered: {[key: string]: boolean}, filter: RegExp) {
    return Object.keys(unfiltered).reduce<{[key: string]: boolean}>((obj, key) => {
        if (filter.test(key)) obj[key] = unfiltered[key]
        return obj
    }, {})
}

export function sum(values: number[]) {
    return values.reduce((sum, value) => sum + value, 0)
}

export function replace(data: string, entries: [find: string, replace: string][]) {
    for (const entry of entries) {
        data = data.replaceAll(entry[0], entry[1])
    }
    return data
}
