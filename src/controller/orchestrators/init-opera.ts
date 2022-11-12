import {Orchestrators} from '#repository/orchestrators'
import {OperaNativeConfig} from '#orchestrators/opera'

export default async function (option: OperaNativeConfig) {
    const data = Orchestrators.getConfig()
    data.opera = option
    Orchestrators.setConfig(data)
}
