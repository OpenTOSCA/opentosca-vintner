import Plugins from '#plugins'
import {xOperaNativeConfig} from '#plugins/xopera'
import lock from '#utils/lock'

export default async function (option: xOperaNativeConfig) {
    await lock.try(Plugins.getLockKey(), () => {
        const data = Plugins.loadConfig()
        data.xOpera = option
        Plugins.setConfig(data)
    })
}
