import {Instance} from '#repository/instances'
import update from '#controller/instances/update'
import resolve from '#controller/instances/resolve'
import * as utils from '#utils'
import * as validator from '#validator'
import {emitter, events} from '#utils/emitter'
import {critical} from '#utils/lock'

const cache: Map<string, {key: string; value: string}[]> = new Map()
const running: {[key: string]: boolean} = {}
const stopped: {[key: string]: boolean} = {}

type InstancesAdaptationOptions = {instance: string; key: string; value: string}

/**
 * Monitor: Collect sensor data and trigger adaptation
 */
export default async function (options: InstancesAdaptationOptions) {
    if (stopped[options.instance]) return

    const entry = {key: options.key, value: options.value}
    if (cache.has(options.instance)) return cache.get(options.instance)!.push(entry)

    const instance = new Instance(options.instance)
    if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)

    cache.set(options.instance, [entry])
    emitter.emit(events.start_adaptation, instance)
}

/**
 * Adaptation Loop
 */
emitter.on(events.start_adaptation, async (instance: Instance) => {
    // Stop loop if there are no cache entries
    if (!validator.isDefined(cache.get(instance.getName()))) return
    // Stop current process if there is already another one running
    if (running[instance.getName()]) return
    // Stop loop if adaptation is stopped
    if (stopped[instance.getName()]) return

    running[instance.getName()] = true
    await critical(instance.getName(), async () => {
        // Sanity
        if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)

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
        await instance.setVariabilityInputs(inputs, time)

        // Reset cache
        cache.delete(instance.getName())

        /**
         * Analyze: Resolve variability
         */
        await resolve({
            instance: instance.getName(),
            inputs: instance.hasVariabilityInputs() ? instance.getVariabilityInputs() : undefined,
            time,
            preset: instance.hasVariabilityPreset() ? instance.getVariabilityPreset() : undefined,
        })

        /**
         * Analyze and Execute: Update deployment
         */
        await update({
            instance: instance.getName(),
            inputs: instance.hasServiceInputs() ? instance.getServiceInputs() : undefined,
            time,
        })

        running[instance.getName()] = false
        emitter.emit(events.start_adaptation, instance)
    })
})

/**
 * Stop adaptation, e.g., before undeployment
 */
emitter.on(events.stop_adaptation, (instance: Instance) => {
    stopped[instance.getName()] = true
})
