import * as assert from '#assert'
import {Config} from '#controller/template/utils/config'

export type TemplateUnpullOptions = {
    dir: string
}

export default async function (options: TemplateUnpullOptions) {
    assert.isDefined(options.dir, 'Directory not defined')

    const config = new Config(options.dir, {link: false})
    config.load()

    await config.unpull()
}
