import {UnfurlWSLConfig} from '#plugins/unfurl'
import Plugins from '#plugins'

export default async function (option: UnfurlWSLConfig) {
    const data = Plugins.getConfig()
    data.unfurlWSL = option
    Plugins.setConfig(data)
}
