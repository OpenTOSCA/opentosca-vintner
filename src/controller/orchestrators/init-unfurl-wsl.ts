import {UnfurlWSLConfig} from '#plugins/unfurl'
import Plugins from '#plugins'
import lock from '#utils/lock'

export default async function (option: UnfurlWSLConfig) {
    await lock.try(Plugins.getLockKey(), () => {
        const data = Plugins.getConfig()
        data.unfurlWSL = option
        Plugins.setConfig(data)
    })
}
