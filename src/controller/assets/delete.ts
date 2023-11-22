import * as assert from '#assert'
import {Asset} from '#repositories/assets'

export type AssetsDeleteOptions = {name?: string}

export default async function (options: AssetsDeleteOptions) {
    assert.isDefined(options.name, 'Name not defined')
    const asset = new Asset(options.name)
    await asset.delete()
}
