import * as files from '#files'
import Registry from '#technologies/plugins/rules/registry'

export type RuleOptions = {
    format?: string
}

export default async function (options: RuleOptions) {
    options.format = options.format ?? 'yaml'
    return files.toFormat(Registry.rules, options.format)
}
