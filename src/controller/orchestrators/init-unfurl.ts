import {Orchestrators} from '../../repository/orchestrators'
import {UnfurlNativeConfig} from '../../orchestrators/unfurl'

export default async function (option: UnfurlNativeConfig) {
    const data = Orchestrators.getConfig()
    data.unfurl = option
    Orchestrators.setConfig(data)
}
