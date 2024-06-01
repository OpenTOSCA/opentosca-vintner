import {ACTIONS} from '#machines/instance'
import {Instance} from '#repositories/instances'
import * as Resolver from '#resolver'
import * as utils from '#utils'
import lock from '#utils/lock'

export type InstanceResolveOptions = {
    instance: string
    presets?: string[]
    inputs?: string
    force?: boolean
    lock?: boolean
    machine?: boolean
}

export default async function (options: InstanceResolveOptions) {
    options.force = options.force ?? false
    options.lock = options.lock ?? !options.force
    options.machine = options.machine ?? !options.force

    const time = utils.now()
    const instance = new Instance(options.instance)

    await lock.try(
        instance.getLockKey(),
        async () => {
            await instance.machine.try(
                ACTIONS.RESOLVE,
                async () => {
                    // Resolve variability
                    const result = await Resolver.run({
                        template: instance.getVariableServiceTemplate(),
                        inputs: options.inputs,
                        presets: options.presets,
                    })

                    // Store used variability inputs
                    // Required later for self-adaptation
                    // Note, used presets are resolved to respective variability inputs
                    await instance.setVariabilityInputs(result.inputs, time)

                    // Store variability resolved service template
                    await instance.setServiceTemplate(result.template, time)
                    await instance.setResolvedTimestamp(time)
                },
                options.machine
            )
        },
        options.lock
    )
}
