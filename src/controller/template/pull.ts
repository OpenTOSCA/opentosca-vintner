import * as assert from '#assert'
import {Config} from '#controller/template/utils/config'

export type TemplatePullOptions = {
    dir: string
    link?: boolean
}

export default async function (options: TemplatePullOptions) {
    assert.isDefined(options.dir, 'Directory not defined')

    const config = new Config(options.dir, {link: options.link})
    config.load()

    await config.pull()
}
