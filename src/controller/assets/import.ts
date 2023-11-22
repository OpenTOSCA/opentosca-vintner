import * as assert from '#assert'
import * as check from '#check'
import {Asset} from '#repositories/assets'

export type AssetsImportOptions = {name?: string; file?: string; content?: string}

export default async function (options: AssetsImportOptions) {
    assert.isDefined(options.name, 'Name not defined')
    assert.isName(options.name)

    const asset = new Asset(options.name)
    if (asset.exists()) throw new Error(`Asset ${options.name} already exists`)

    if (check.isDefined(options.file)) return asset.import({file: options.file})
    if (check.isDefined(options.content)) return asset.store(options.content)
    throw new Error(`File and content not defined`)
}
