import * as assert from '#assert'
import {ACTIONS} from '#machines/instance'
import {Instance} from '#repositories/instances'
import lock from '#utils/lock'

export type InstanceStateOptions = {
    instance: string
    state: string
    force?: boolean
    lock?: boolean
    machine?: boolean
}

export default async function (options: InstanceStateOptions) {
    assert.isString(options.instance)

    options.force = options.force ?? false
    options.lock = options.lock ?? !options.force

    const instance = new Instance(options.instance)
    await lock.try(
        instance.getLockKey(),
        async () => {
            instance.assert()
            instance.machine.noop(ACTIONS.STATE, options.machine)
            instance.setState(options.state as any)
        },
        options.lock
    )
}
