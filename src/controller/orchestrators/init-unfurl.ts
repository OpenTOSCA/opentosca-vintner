import Plugins from '#plugins'
import {UnfurlNativeConfig} from '#plugins/unfurl'
import lock from '#utils/lock'

export default async function (option: UnfurlNativeConfig) {
    await lock.try(Plugins.getLockKey(), () => {
        const data = Plugins.getConfig()
        data.unfurl = option
        Plugins.setConfig(data)
    })
}
