import * as assert from '#assert'
import {ACTIONS} from '#machines/instance'
import orchestrators from '#orchestrators'
import {Instance} from '#repositories/instances'
import * as utils from '#utils'
import lock from '#utils/lock'

export type InstancesUpdateOptions = {
    instance: string
    inputs?: string
    time?: number
    verbose?: boolean
    force?: boolean
    lock?: boolean
    machine?: boolean
}

export default async function (options: InstancesUpdateOptions) {
    assert.isString(options.instance)

    options.force = options.force ?? false
    options.lock = options.lock ?? !options.force
    options.machine = options.machine ?? !options.force

    const instance = new Instance(options.instance)
    await lock.try(
        instance.getLockKey(),
        async () => {
            instance.assert()

            await instance.machine.try(
                ACTIONS.UPDATE,
                async () => {
                    instance.setServiceInputs(options.time ?? utils.now(), options.inputs)
                    await orchestrators.get().update(instance, {time: options.time, verbose: options.verbose})
                },
                options.machine
            )
        },
        options.lock
    )
}
