import config from '#config'
import {xOperaWSLConfig} from '#orchestrators/xopera'
import lock from '#utils/lock'

export default async function (option: xOperaWSLConfig) {
    await lock.try(config.lock, () => {
        const data = config.load()
        data.xOperaWSL = option
        config.set(data)
    })
}
