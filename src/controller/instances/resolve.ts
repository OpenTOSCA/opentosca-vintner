import {Instance} from '#repository/instances'
import * as utils from '#utils'
import lock from '#utils/lock'
import Resolver from '#resolver'

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
            template: instance.getVariableServiceTemplate(),
            inputs: await Resolver.loadInputs(options.inputs),
            presets: options.presets,
        })

        // Store used variability inputs
        // Basically only when used in the CLI during initial deployment
        // Required later for self-adaptation
        // Note, used preset is resolved to respective variability inputs
        await instance.setVariabilityInputs(result.inputs, time)

        // Store variability resolved service template
        await instance.setServiceTemplate(result.template, time)
        await instance.setTime(time)
    })
}
