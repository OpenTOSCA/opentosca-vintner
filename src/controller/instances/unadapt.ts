import * as assert from '#assert'
import {Instance} from '#repositories/instances'
import {emitter, events} from '#utils/emitter'

type UnadaptationOptions = {instance: string}

export default async function (options: UnadaptationOptions) {
    assert.isString(options.instance)

    const instance = new Instance(options.instance)
    instance.assert()
    emitter.emit(events.stop_adaptation, instance)
}
