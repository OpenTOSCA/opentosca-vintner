import {OperaWLSConfig} from '#plugins/opera'
import Plugins from '#plugins'

export default async function (option: OperaWLSConfig) {
    const data = Plugins.getConfig()
    data.operaWSL = option
    Plugins.setConfig(data)
}
