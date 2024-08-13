import * as assert from '#assert'
import {NodeType, PropertyDefinition} from '#spec/node-type'
import {UnexpectedError} from '#utils/error'
import {METADATA, PROPERTIES} from './types'

// TODO: does not consider inherited types

export function mapProperties(
    type: NodeType,
    options: {quote?: boolean; format?: 'map' | 'list' | 'ini'; ignore?: string[]} = {}
) {
    options.quote = options.quote ?? true
    options.format = options.format ?? 'list'
    options.ignore = options.ignore ?? []

    const list = Object.entries(type.properties || {})
        .filter(([propertyName, propertyDefinition]) => {
            const metadata = propertyDefinition.metadata || {}
            const ignore = metadata[METADATA.VINTNER_IGNORE]
            return !(ignore === true || ignore === 'true')
        })
        .map(([propertyName, propertyDefinition]) => {
            const metadata = propertyDefinition.metadata || {}

            const name = metadata[METADATA.VINTNER_NAME] ?? propertyName.toUpperCase()
            assert.isString(name)

            const value = options.quote ? `"{{ SELF.${propertyName} }}"` : `{{ SELF.${propertyName} }}`

            return {
                name,
                value,
            }
        })
        .filter(it => !options.ignore!.includes(it.name))

    if (options.format === 'list') return list

    if (options.format === 'map')
        return list.reduce<{
            [key: string]: string
        }>((env, it) => {
            env[it.name] = it.value
            return env
        }, {})

    if (options.format === 'ini') return list.map(it => `${it.name}=${it.value}`)

    throw new UnexpectedError()
}

export function secureApplicationProtocolPropertyDefinition(type: NodeType): {[key: string]: PropertyDefinition} {
    assert.isDefined(type.properties)

    const definition = type.properties[PROPERTIES.APPLICATION_PROTOCOL]
    assert.isDefined(definition)
    assert.isDefined(definition.default)
    assert.isString(definition.default)

    return {
        [PROPERTIES.APPLICATION_PROTOCOL]: {
            type: 'string',
            default: `${definition.default}s`,
        },
    }
}
