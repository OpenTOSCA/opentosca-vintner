import * as files from '#files'
import {NormativeTypes} from '#normative'
import * as utils from '#utils'

export type NormativeOptions = {
    orchestrator?: string
    format?: string
    profile?: boolean
    base?: boolean
    extended?: boolean
}

export default async function (options: NormativeOptions) {
    /**
     * Defaults
     */
    options.format = options.format ?? 'yaml'
    options.base = options.base ?? true
    options.extended = options.extended ?? true

    /**
     * Normative types
     */
    const normative = NormativeTypes(options.orchestrator)

    /**
     * Filter
     */
    const types = []
    if (options.profile) types.push(normative.profile.template)
    if (options.base) types.push(normative.core.template)
    if (options.extended) types.push(normative.extended.template)

    /**
     * Simplify
     */
    const output = types.length === 1 ? utils.first(types) : types

    /**
     * Format
     */
    return files.toFormat(output, options.format)
}
