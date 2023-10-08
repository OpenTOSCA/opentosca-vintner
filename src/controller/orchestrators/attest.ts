import Plugins from '#plugins'

export type OrchestratorsAttestOptions = {orchestrator: string}

export default async function (option: OrchestratorsAttestOptions) {
    await Plugins.getOrchestrator(option.orchestrator).attest()
}
