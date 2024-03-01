import orchestrators from '#orchestrators'
import {Instance} from '#repositories/instances'
import lock from '#utils/lock'

export type InstancesValidateOptions = {instance: string; verbose?: boolean; inputs?: string; dry?: boolean}

export default async function (options: InstancesValidateOptions) {
    const instance = new Instance(options.instance)

    await lock.try(instance.getLockKey(), async () => {
        if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)
        await orchestrators
            .get()
            .validate(instance, {verbose: options.verbose, inputs: options.inputs, dry: options.dry})
    })
}
