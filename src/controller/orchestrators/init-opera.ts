import {OperaNativeConfig} from '#plugins/opera'
import Plugins from '#plugins'

export default async function (option: OperaNativeConfig) {
    const data = Plugins.getConfig()
    data.opera = option
    Plugins.setConfig(data)
}
