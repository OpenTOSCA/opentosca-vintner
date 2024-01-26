import config from '#config'
import {UnfurlWSLConfig} from '#orchestrators/unfurl'
import lock from '#utils/lock'

export default async function (option: UnfurlWSLConfig) {
    await lock.try(config.lock, () => {
        const data = config.load()
        data.unfurlWSL = option
        config.set(data)
    })
}
