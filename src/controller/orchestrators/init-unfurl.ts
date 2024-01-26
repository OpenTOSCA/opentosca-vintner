import config from '#config'
import {UnfurlNativeConfig} from '#orchestrators/unfurl'
import lock from '#utils/lock'

export default async function (option: UnfurlNativeConfig) {
    await lock.try(config.lock, () => {
        const data = config.load()
        data.unfurl = option
        config.set(data)
    })
}
