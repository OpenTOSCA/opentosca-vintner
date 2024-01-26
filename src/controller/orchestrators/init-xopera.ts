import config from '#config'
import {xOperaNativeConfig} from '#orchestrators/xopera'
import lock from '#utils/lock'

export default async function (option: xOperaNativeConfig) {
    await lock.try(config.lock, () => {
        const data = config.load()
        data.xOpera = option
        config.set(data)
    })
}
