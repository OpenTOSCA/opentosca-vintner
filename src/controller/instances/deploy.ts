import orchestrators from '#orchestrators'
import {Instance} from '#repositories/instances'
import std from '#std'
import * as utils from '#utils'
import lock from '#utils/lock'

export type InstancesDeployOptions = {instance: string; inputs?: string; verbose?: boolean; retry?: boolean}

export default async function (options: InstancesDeployOptions) {
    options.retry = options.retry ?? true

    const instance = new Instance(options.instance)
    await lock.try(instance.getLockKey(), async () => {
        if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)
        instance.setServiceInputs(utils.now(), options.inputs)

        const orchestrator = orchestrators.get()
        try {
            await orchestrator.deploy(instance, {verbose: options.verbose})
        } catch (e) {
            if (!options.retry) throw e
            std.log(e)
            await orchestrator.continue(instance, {verbose: options.verbose})
        }
    })
}
