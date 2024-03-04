import * as assert from '#assert'
import * as files from '#files'
import path from 'path'

export type TemplatePreloadOptions = {
    template: string
}

export type PreloadConfig = PreloadEntry[]
export type PreloadEntry = {
    source: string
    target: string
}

export default async function (options: TemplatePreloadOptions) {
    assert.isDefined(options.template, 'Template not defined')

    const file = path.join(options.template, 'preload.yaml')
    if (!files.exists(file)) return

    const config = files.loadYAML<PreloadConfig>(file)
    assert.isArray(config)

    for (const entry of config) {
        assert.isString(entry.source)
        assert.isString(entry.target)

        // TODO: windows vs linux?!
        await files.sync(path.join(options.template, entry.source), path.join(options.template, entry.target))
    }
}
