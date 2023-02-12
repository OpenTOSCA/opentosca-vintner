import {v4 as uuid4} from 'uuid'
import * as validator from './validator'

export function generateNonce() {
    return uuid4()
}

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
        if (validator.isUndefined(map[id])) map[id] = []
        map[id].push(element)
        return map
    }, {})
}

export function toList<T>(data: T | T[] | undefined): T[] {
    if (validator.isUndefined(data)) return []
    if (Array.isArray(data)) return data
    return [data]
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
    if (validator.isUndefined(obj)) return true
    if (validator.isArray(obj)) return obj.length === 0
    if (validator.isObject(obj)) return Object.keys(obj).length === 0
    throw new Error(`Can not check if obj ${prettyJSON(obj)} is empty`)
}

export function listDelete<T>(list?: Array<T>, indexes?: Array<number>) {
    if (validator.isUndefined(list) || validator.isUndefined(indexes)) return
    indexes.sort()
    while (indexes.length) {
        const index = indexes.pop()
        if (validator.isUndefined(index)) return
        list.splice(index, 1)
    }
}

export function deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)) as T
}

export function prettyJSON(obj: any) {
    return JSON.stringify(obj, null, 4)
}

export function joinNotNull(array: (string | undefined)[], separator: string) {
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
    return new Date().getTime()
}

export async function sleep(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
