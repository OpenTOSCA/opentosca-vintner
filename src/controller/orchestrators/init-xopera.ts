import {xOperaNativeConfig} from '#plugins/xopera'
import Plugins from '#plugins'
import {critical} from '#utils/lock'

export default async function (option: xOperaNativeConfig) {
    await critical(Plugins.getLockKey(), () => {
        const data = Plugins.getConfig()
        data.xOpera = option
        Plugins.setConfig(data)
    })
}
