import {Instance} from '#repositories/instances'
import {Template} from '#repositories/templates'
import * as utils from '#utils'
import lock from '#utils/lock'

export type InstancesSwapOptions = {instance: string; template: string; lock?: boolean}

export default async function (options: InstancesSwapOptions) {
    options.lock = options.lock ?? true

    const instance = new Instance(options.instance)
    const template = new Template(options.template)

    await lock.try(
        instance.getLockKey(),
        async () => {
            await lock.try(template.getLockKey(), async () => {
                if (!instance.exists()) throw new Error(`Instance ${options.instance} does not exists`)
                if (!template.exists()) throw new Error(`Template ${options.instance} does not exist`)
                instance.setTemplate(options.template, utils.now())
            })
        },
        options.lock
    )
}
