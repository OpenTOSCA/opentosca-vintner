import * as assert from '#assert'
import * as files from '#files'
import Registry from '#technologies/plugins/rules/registry'

export type ScenariosOptions = {
    component: string
    format?: string
}

export default async function (options: ScenariosOptions) {
    assert.isDefined(options.component)

    const scenarios = Registry.rules

    // TODO: filter for component
    // TODO: filter for artifact
    // TODO: filter for hosting stack

    options.format = options.format ?? 'yaml'
    return files.toFormat(scenarios, options.format)
}
