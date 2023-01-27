import {UnfurlNativeConfig} from '#plugins/unfurl'
import Plugins from '#plugins'

export default async function (option: UnfurlNativeConfig) {
    const data = Plugins.getConfig()
    data.unfurl = option
    Plugins.setConfig(data)
}
