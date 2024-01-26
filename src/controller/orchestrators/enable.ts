import config from '#config'
import lock from '#utils/lock'

export type OrchestratorsEnableOptions = {orchestrator: string}

export default async function (option: OrchestratorsEnableOptions) {
    await lock.try(config.lock, () => {
        const data = config.load()
        data.enabled = option.orchestrator
        config.set(data)
    })
}
