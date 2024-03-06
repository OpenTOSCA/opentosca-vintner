import * as assert from '#assert'
import * as files from '#files'
import path from 'path'

export type TemplatePullOptions = {
    template: string
    link?: boolean
}

export type Config = {
    dependencies: Dependencies
}

export type Dependencies = TemplateDependency[]
export type TemplateDependency = {
    source: string
    target: string
}

export default async function (options: TemplatePullOptions) {
    assert.isDefined(options.template, 'Template not defined')

    const file = path.join(options.template, 'config.yaml')
    if (!files.exists(file)) return

    const config = files.loadYAML<Config>(file)
    assert.isArray(config.dependencies)

    for (const dependency of config.dependencies) {
        assert.isString(dependency.source)
        assert.isString(dependency.target)

        const source = path.isAbsolute(dependency.source)
            ? dependency.source
            : path.join(options.template, dependency.source)
        const target = path.join(options.template, dependency.target)

        if (options.link) {
            await files.link(source, target)
        } else {
            await files.sync(source, target)
        }
    }
}