import orchestrators from '#orchestrators'

export type OrchestratorsAttestOptions = {orchestrator: string}

export default async function (option: OrchestratorsAttestOptions) {
    await orchestrators.get(option.orchestrator).attest()
}
