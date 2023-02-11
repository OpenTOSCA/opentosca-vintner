import {UnfurlWSLConfig} from '#plugins/unfurl'
import Plugins from '#plugins'
import {critical} from '#utils/lock'

export default async function (option: UnfurlWSLConfig) {
    await critical(Plugins.getLockKey(), () => {
        const data = Plugins.getConfig()
        data.unfurlWSL = option
        Plugins.setConfig(data)
    })
}
