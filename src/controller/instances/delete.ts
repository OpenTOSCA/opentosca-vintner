import * as assert from '#assert'
import {ACTIONS} from '#machines/instance'
import {Instance} from '#repositories/instances'
import lock from '#utils/lock'

export type InstancesDeleteOptions = {instance: string; force?: boolean; lock?: boolean; machine?: boolean}

export default async function (options: InstancesDeleteOptions) {
    assert.isString(options.instance)

    options.force = options.force ?? false
    options.lock = options.lock ?? !options.force
    options.machine = options.machine ?? !options.force

    const instance = new Instance(options.instance)
    await lock.try(
        instance.getLockKey(),
        async () => {
            await instance.machine.try(
                ACTIONS.DELETE,
                async () => {
                    instance.delete()
                },
                options.machine
            )
        },
        options.lock
    )
}
