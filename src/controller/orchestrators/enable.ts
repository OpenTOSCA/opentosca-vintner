import Plugins from '#plugins'
import lock from '#utils/lock'

export type OrchestratorsEnableOptions = {orchestrator: string}

export default async function (option: OrchestratorsEnableOptions) {
    await lock.try(Plugins.getLockKey(), () => {
        const data = Plugins.loadConfig()
        data.enabled = option.orchestrator
        Plugins.setConfig(data)
    })
}
