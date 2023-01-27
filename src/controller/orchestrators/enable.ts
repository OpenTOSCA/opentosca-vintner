import Plugins from '#plugins'

export type OrchestratorsEnableArguments = {orchestrator: string}

export default async function (option: OrchestratorsEnableArguments) {
    const data = Plugins.getConfig()
    data.enabled = option.orchestrator
    Plugins.setConfig(data)
}
