import {Orchestrators} from '#repository/orchestrators'

export type OrchestratorsEnableArguments = {orchestrator: string}

export default async function (option: OrchestratorsEnableArguments) {
    const data = Orchestrators.getConfig()
    data.enabled = option.orchestrator
    Orchestrators.setConfig(data)
}
