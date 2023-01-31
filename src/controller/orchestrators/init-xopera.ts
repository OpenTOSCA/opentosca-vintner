import {xOperaNativeConfig} from '#plugins/xopera'
import Plugins from '#plugins'

export default async function (option: xOperaNativeConfig) {
    const data = Plugins.getConfig()
    data.xOpera = option
    Plugins.setConfig(data)
}
