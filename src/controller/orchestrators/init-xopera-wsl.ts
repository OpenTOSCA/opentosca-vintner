import {xOperaWLSConfig} from '#plugins/xopera'
import Plugins from '#plugins'
import lock from '#utils/lock'

export default async function (option: xOperaWLSConfig) {
    await lock.try(Plugins.getLockKey(), () => {
        const data = Plugins.getConfig()
        data.xOperaWSL = option
        Plugins.setConfig(data)
    })
}
