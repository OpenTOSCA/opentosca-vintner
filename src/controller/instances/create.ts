import {Instance} from '#repository/instances'
import {critical} from '#utils/lock'
import {Template} from '#repository/templates'

export type InstancesCreateOptions = {instance: string; template: string}

export default async function (options: InstancesCreateOptions) {
    const instance = new Instance(options.instance)
    const template = new Template(options.template)

    await critical(instance.getLockKey(), async () => {
        await critical(template.getLockKey(), async () => {
            if (instance.exists()) throw new Error(`Instance ${options.instance} already exists`)
            if (!template.exists()) throw new Error(`Template ${options.instance} does not exist`)
            instance.create().setTemplate(options.template)
        })
    })
}
