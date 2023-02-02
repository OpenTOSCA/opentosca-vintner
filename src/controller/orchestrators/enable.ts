import Plugins from '#plugins'

export type OrchestratorsEnableOptions = {orchestrator: string}

export default async function (option: OrchestratorsEnableOptions) {
    const data = Plugins.getConfig()
    data.enabled = option.orchestrator
    Plugins.setConfig(data)
}
