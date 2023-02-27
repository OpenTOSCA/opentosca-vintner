import {emitter, events} from '#utils/emitter'
import {Instance} from '#repository/instances'

type UnadaptationOptions = {instance: string}

export default async function (options: UnadaptationOptions) {
    const instance = new Instance(options.instance)
    if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)
    emitter.emit(events.stop_adaptation, instance)
}
