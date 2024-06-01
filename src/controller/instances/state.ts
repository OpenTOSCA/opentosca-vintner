import * as assert from '#assert'
import {Instance} from '#repositories/instances'
import lock from '#utils/lock'

export type InstanceStateOptions = {
    instance?: string
    state?: string
    force?: boolean
    lock?: boolean
}

export default async function (options: InstanceStateOptions) {
    assert.isDefined(options.instance)

    options.force = options.force ?? false
    options.lock = options.lock ?? !options.force

    const instance = new Instance(options.instance)
    await lock.try(
        instance.getLockKey(),
        async () => {
            instance.setState(options.state as any)
        },
        options.lock
    )
}
