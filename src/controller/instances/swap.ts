import {Instance} from '#repository/instances'
import {Template} from '#repository/templates'
import * as utils from '#utils'
import lock from '#utils/lock'

export type InstancesSwapOptions = {instance: string; template: string}

export default async function (options: InstancesSwapOptions) {
    const instance = new Instance(options.instance)
    const template = new Template(options.template)

    await lock.try(instance.getLockKey(), async () => {
        await lock.try(template.getLockKey(), async () => {
            if (!instance.exists()) throw new Error(`Instance ${options.instance} does not exists`)
            if (!template.exists()) throw new Error(`Template ${options.instance} does not exist`)
            instance.setTemplate(options.template, utils.now())
        })
    })
}
