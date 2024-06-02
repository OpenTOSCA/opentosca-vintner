import * as assert from '#assert'
import {ACTIONS} from '#machines/instance'
import orchestrators from '#orchestrators'
import {Instance} from '#repositories/instances'
import lock from '#utils/lock'

export type InstancesOutputsOptions = {
    instance: string
    inputs?: string
    verbose?: boolean
    force?: boolean
    lock?: boolean
    machine?: boolean
}

export default async function (options: InstancesOutputsOptions) {
    assert.isString(options.instance)

    options.force = options.force ?? false
    options.lock = options.lock ?? !options.force
    options.machine = options.machine ?? !options.force

    const instance = new Instance(options.instance)
    await lock.try(instance.getLockKey(), async () => {
        instance.assert()
        instance.machine.noop(ACTIONS.OUTPUTS, options.machine)

        await orchestrators.get().outputs(instance, {verbose: options.verbose})
    })
}
