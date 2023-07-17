import Plugins from '#plugins'
import {UnfurlWSLConfig} from '#plugins/unfurl'
import lock from '#utils/lock'

export default async function (option: UnfurlWSLConfig) {
    await lock.try(Plugins.getLockKey(), () => {
        const data = Plugins.loadConfig()
        data.unfurlWSL = option
        Plugins.setConfig(data)
    })
}
