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

export function firstValue<K, V>(map: {[key: string]: V}): V {
    return Object.values(map).values().next().value
}

export function firstKey<K, V>(map: {[key: string]: V}): string {
    return Object.keys(map).values().next().value
}

export function listIsEmpty<T>(list: Array<T>) {
    return list.length === 0
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

export function deepCopy(obj: any) {
    return JSON.parse(JSON.stringify(obj))
}

export function joinNotNull(array: string[], separator: string) {
    return filterNotNull(array).join(separator)
}

export function filterNotNull(array: any[]) {
    return array.filter(x => x !== undefined && x !== null)
}
