import * as assert from '#assert'
import {ACTIONS} from '#machines/instance'
import {Instance} from '#repositories/instances'
import {ServiceTemplate} from '#spec/service-template'
import lock from '#utils/lock'

export type InstancesInspectOptions = {instance: string; force?: boolean; lock?: boolean; machine?: boolean}

export default async function (options: InstancesInspectOptions) {
    assert.isString(options.instance)

    options.force = options.force ?? false
    options.lock = options.lock ?? !options.force
    options.machine = options.machine ?? !options.force

    let result: ServiceTemplate | undefined

    const instance = new Instance(options.instance)
    await lock.try(
        instance.getLockKey(),
        async () => {
            instance.assert()
            instance.machine.noop(ACTIONS.INSPECT, options.machine)
            result = instance.loadServiceTemplate()
        },
        options.lock
    )

    assert.isDefined(result)
    return result
}
