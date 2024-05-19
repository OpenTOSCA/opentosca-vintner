import * as assert from '#assert'
import orchestrators from '#orchestrators'
import {Instance} from '#repositories/instances'
import lock from '#utils/lock'

export type InstancesDebugOptions = {instance: string; command: string}

export default async function (options: InstancesDebugOptions) {
    assert.isString(options.instance)
    assert.isString(options.command)

    const instance = new Instance(options.instance)
    await lock.try(instance.getLockKey(), async () => {
        if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)
        await orchestrators.get().debug(instance, {command: options.command})
    })
}
