import {NormativeTypes} from '#/normative'
import * as files from '#files'
import * as utils from '#utils'

export type NormativeOptions = {orchestrator?: string; format?: string; base?: boolean; specific?: boolean}

export default async function (options: NormativeOptions) {
    /**
     * Defaults
     */
    options.format = options.format ?? 'yaml'
    options.base = options.base ?? true
    options.specific = options.specific ?? true

    /**
     * Normative types
     */
    const normative = NormativeTypes(options.orchestrator)

    /**
     * Filter
     */
    const types = []
    if (options.base) types.push(normative.base.template)
    if (options.specific) types.push(normative.specific.template)

    /**
     * Simplify
     */
    const output = types.length === 1 ? utils.first(types) : types

    /**
     * Format
     */
    return files.toFormat(output, options.format)
}
