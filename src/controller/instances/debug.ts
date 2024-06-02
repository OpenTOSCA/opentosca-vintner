import * as assert from '#assert'
import {ACTIONS} from '#machines/instance'
import orchestrators from '#orchestrators'
import {Instance} from '#repositories/instances'
import lock from '#utils/lock'

export type InstancesDebugOptions = {
    instance: string
    command: string
    force?: boolean
    lock?: boolean
    machine?: boolean
}

export default async function (options: InstancesDebugOptions) {
    assert.isString(options.instance)
    assert.isString(options.command)

    options.force = options.force ?? false
    options.lock = options.lock ?? !options.force
    options.machine = options.machine ?? !options.force

    const instance = new Instance(options.instance)
    await lock.try(instance.getLockKey(), async () => {
        instance.assert()
        instance.machine.noop(ACTIONS.DEBUG, options.machine)
        await orchestrators.get().debug(instance, {command: options.command})
    })
}
