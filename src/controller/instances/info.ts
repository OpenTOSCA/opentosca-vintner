import * as assert from '#assert'
import {ACTIONS} from '#machines/instance'
import {Instance, InstanceInfo} from '#repositories/instances'
import lock from '#utils/lock'

export type InstancesInfoOptions = {instance: string; force?: boolean; lock?: boolean; machine?: boolean}

export default async function (options: InstancesInfoOptions) {
    assert.isString(options.instance)

    options.force = options.force ?? false
    options.lock = options.lock ?? !options.force
    options.machine = options.machine ?? !options.force

    let result: InstanceInfo | undefined

    const instance = new Instance(options.instance)
    await lock.try(
        instance.getLockKey(),
        async () => {
            instance.assert()
            instance.machine.noop(ACTIONS.INFO, options.machine)
            result = instance.loadInfo()
        },
        options.lock
    )

    assert.isDefined(result)
    return result
}
