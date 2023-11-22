import {Asset} from '#repositories/assets'
import * as assert from '#assert'

export type AssetsContentOptions = {name?: string}

export default async function (options: AssetsContentOptions) {
    assert.isDefined(options.name, 'Name not defined')
    const asset = new Asset(options.name)
    return asset.load()
}
