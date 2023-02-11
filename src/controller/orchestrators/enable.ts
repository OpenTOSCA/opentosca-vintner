import Plugins from '#plugins'
import {critical} from '#utils/lock'

export type OrchestratorsEnableOptions = {orchestrator: string}

export default async function (option: OrchestratorsEnableOptions) {
    await critical(Plugins.getLockKey(), () => {
        const data = Plugins.getConfig()
        data.enabled = option.orchestrator
        Plugins.setConfig(data)
    })
}
