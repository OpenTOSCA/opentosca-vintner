import {Orchestrators} from '#repository/orchestrators'
import {OperaWLSConfig} from '#plugins/opera'

export default async function (option: OperaWLSConfig) {
    const data = Orchestrators.getConfig()
    data.operaWSL = option
    Orchestrators.setConfig(data)
}
