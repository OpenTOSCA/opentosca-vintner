import {Instance} from '#repository/instances'
import update from '#controller/instances/update'
import resolve from '#controller/instances/resolve'
import * as utils from '#utils'
import * as validator from '#validator'
import {emitter} from '#utils/emitter'

const cache: Map<string, {key: string; value: string}[]> = new Map()
const running: {[key: string]: boolean} = {}

type AdaptationArguments = {instance: string; key: string; value: string}

/**
 * Monitor: Collect sensor data and trigger adaptation
 */
export default async function (options: AdaptationArguments) {
    const entry = {key: options.key, value: options.value}
    if (cache.has(options.instance)) return cache.get(options.instance)!.push(entry)

    const instance = new Instance(options.instance)
    if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)

    cache.set(options.instance, [entry])
    emitter.emit('adapt', instance)
}

/**
 * Run adaptation if not already running and if there are cached values
 */
emitter.on('adapt', _on)
emitter.on('adapted', _on)

async function _on(instance: Instance) {
    if (validator.isDefined(cache.get(instance.getName())) && !running[instance.getName()]) {
        running[instance.getName()] = true
        await adapt(instance)
    }
}

/**
 * Adapt instance
 */
async function adapt(instance: Instance) {
    // Current time used as correlation identifier
    const time = utils.getTime()

    /**
     * Monitor: Store sensor data
     */
    // Get cache entries
    const entries = cache.get(instance.getName())
    if (validator.isUndefined(entries)) throw new Error(`Values of instance "${instance.getName()}" are empty`)

    // Construct current variability inputs
    const inputs = instance.loadVariabilityInputs()
    for (const entry of entries) {
        inputs[entry.key] = entry.value
    }
    instance.setVariabilityInputs(inputs, time)

    // Reset cache
    cache.delete(instance.getName())

    /**
     * Analyze: nil
     */

    /**
     * Plan: Resolve variability
     */
    // TODO: also handle variability preset
    await resolve({instance: instance.getName(), inputs: instance.getVariabilityInputs(), time})

    /**
     * Execute: Update deployment
     */
    await update({
        instance: instance.getName(),
        inputs: instance.hasServiceInputs() ? instance.getServiceInputs() : undefined,
        time,
    })

    running[instance.getName()] = false
    emitter.emit('adapted', instance)
}
