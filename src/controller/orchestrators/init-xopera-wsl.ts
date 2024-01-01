import Plugins from '#plugins'
import {xOperaWSLConfig} from '#plugins/xopera'
import lock from '#utils/lock'

export default async function (option: xOperaWSLConfig) {
    await lock.try(Plugins.getLockKey(), () => {
        const data = Plugins.loadConfig()
        data.xOperaWSL = option
        Plugins.setConfig(data)
    })
}
