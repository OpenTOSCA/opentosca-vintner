import Plugins from '#plugins'
import {Instance} from '#repository/instances'
import * as utils from '#utils'
import lock from '#utils/lock'

export type InstancesContinueOptions = {instance: string; inputs?: string; verbose?: boolean}

export default async function (options: InstancesContinueOptions) {
    const instance = new Instance(options.instance)

    await lock.try(instance.getLockKey(), async () => {
        if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)
        if (options.inputs) instance.setServiceInputs(options.inputs, utils.now())
        await Plugins.getOrchestrator().continue(instance, {verbose: options.verbose})
    })
}