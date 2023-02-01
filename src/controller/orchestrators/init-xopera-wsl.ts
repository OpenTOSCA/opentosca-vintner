import {xOperaWLSConfig} from '#plugins/xopera'
import Plugins from '#plugins'

export default async function (option: xOperaWLSConfig) {
    const data = Plugins.getConfig()
    data.xOperaWSL = option
    Plugins.setConfig(data)
}
