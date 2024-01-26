import orchestrators from '#orchestrators'
import {Instance} from '#repositories/instances'
import * as utils from '#utils'
import lock from '#utils/lock'

export type InstancesDeployOptions = {instance: string; inputs?: string; verbose?: boolean}

export default async function (options: InstancesDeployOptions) {
    const instance = new Instance(options.instance)

    await lock.try(instance.getLockKey(), async () => {
        if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)
        instance.setServiceInputs(utils.now(), options.inputs)
        await orchestrators.get().deploy(instance, {verbose: options.verbose})
    })
}
