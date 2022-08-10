export function isUndefined(element: unknown): element is undefined {
    return typeof element === 'undefined'
}

export function isString(element: unknown): element is string {
    return typeof element === 'string'
}

export function ensureString(element: unknown): asserts element is string {
    if (!isString(element)) throw new Error(`Element "${JSON.stringify(element)}" is not a string`)
}

export function isBoolean(element: unknown): element is boolean {
    return typeof element === 'boolean'
}

export function ensureBoolean(element: unknown): asserts element is boolean {
    if (!isBoolean(element)) throw new Error(`Element "${JSON.stringify(element)}" is not a boolean`)
}

export function isNumber(element: unknown): element is number {
    return typeof element === 'number'
}

export function ensureNumber(element: unknown): asserts element is number {
    if (!isNumber(element)) throw new Error(`Element "${JSON.stringify(element)}" is not a number`)
}

export function isArray(element: unknown): element is Array<unknown> {
    return Array.isArray(element)
}

export function isObject(element: unknown): element is object {
    return typeof element === 'object'
}

export function ensureObject(element: unknown): asserts element is object {
    if (!isObject(element)) throw new Error(`Element "${JSON.stringify(element)}" is not an object`)
}

export function hasProperty<T extends {}, U extends PropertyKey>(
    element: T,
    property: U
): element is T & Record<U, unknown> {
    return Object.prototype.hasOwnProperty.call(element, property)
}
