import {xOperaWLSConfig} from '#plugins/xopera'
import Plugins from '#plugins'
import {critical} from '#utils/lock'

export default async function (option: xOperaWLSConfig) {
    await critical(Plugins.getLockKey(), () => {
        const data = Plugins.getConfig()
        data.xOperaWSL = option
        Plugins.setConfig(data)
    })
}
