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

type AdaptationArguments = {instance: string; key: string; value: string}

/**
 * Monitor: Collect sensor data and trigger adaptation
 */
export default async function (options: AdaptationArguments) {
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
    if (
        // If there are cached entries
        validator.isDefined(cache.get(instance.getName())) &&
        // If adaptation is not currently running
        !running[instance.getName()] &&
        // If adaptation has not been stopped
        !stopped[instance.getName()]
    ) {
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
            instance.setVariabilityInputs(inputs, time)

            // Reset cache
            cache.delete(instance.getName())

            /**
             * Analyze: Resolve variability
             */
            // TODO: also handle variability preset
            await resolve({instance: instance.getName(), inputs: instance.getVariabilityInputs(), time})

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
    }
})

/**
 * Stop adaptation, e.g., before undeployment
 */
emitter.on(events.stop_adaptation, (instance: Instance) => {
    stopped[instance.getName()] = true
})
