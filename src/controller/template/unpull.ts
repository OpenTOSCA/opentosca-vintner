import * as assert from '#assert'
import {Config} from '#controller/template/utils/config'

export type TemplateUnpullOptions = {
    dir: string
    link?: boolean
}

export default async function (options: TemplateUnpullOptions) {
    assert.isDefined(options.dir, 'Directory not defined')

    const config = new Config(options.dir, {link: options.link})
    config.load()

    await config.unpull()
}
