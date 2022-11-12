import {Orchestrators} from '#repository/orchestrators'
import {UnfurlWSLConfig} from '#orchestrators/unfurl'

export default async function (option: UnfurlWSLConfig) {
    const data = Orchestrators.getConfig()
    data.unfurlWSL = option
    Orchestrators.setConfig(data)
}
