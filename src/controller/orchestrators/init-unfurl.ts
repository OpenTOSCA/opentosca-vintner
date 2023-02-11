import {UnfurlNativeConfig} from '#plugins/unfurl'
import Plugins from '#plugins'
import {critical} from '#utils/lock'

export default async function (option: UnfurlNativeConfig) {
    await critical(Plugins.getLockKey(), () => {
        const data = Plugins.getConfig()
        data.unfurl = option
        Plugins.setConfig(data)
    })
}
