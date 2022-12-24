import {Orchestrators} from '#repository/orchestrators'
import {OperaNativeConfig} from '#plugins/opera'

export default async function (option: OperaNativeConfig) {
    const data = Orchestrators.getConfig()
    data.opera = option
    Orchestrators.setConfig(data)
}
