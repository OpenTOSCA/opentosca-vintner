import {Instance} from '#repository/instances'
import Resolver from '#resolver'
import * as utils from '#utils'
import lock from '#utils/lock'

export type InstanceResolveOptions = {
    instance: string
    presets?: string[]
    inputs?: string
}

export default async function (options: InstanceResolveOptions) {
    const time = utils.now()
    const instance = new Instance(options.instance)

    await lock.try(instance.getLockKey(), async () => {
        // Resolve variability
        const result = await Resolver.resolve({
            template: instance.loadVariableServiceTemplate(),
            inputs: await Resolver.loadInputs(options.inputs),
            presets: Resolver.loadPresets(options.presets),
        })

        // Store used variability inputs
        // Required later for self-adaptation
        // Note, used presets are resolved to respective variability inputs
        await instance.setVariabilityInputs(result.inputs, time)

        // Store variability resolved service template
        await instance.setServiceTemplate(result.template, time)
        await instance.setResolvedTimestamp(time)
    })
}
