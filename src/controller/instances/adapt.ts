import {Instance} from '#repository/instances'
import update from '#controller/instances/update'
import resolve from '#controller/instances/resolve'
import * as utils from '#utils'
import * as validator from '#validator'
import {emitter, events} from '#utils/emitter'
import {critical} from '#utils/lock'
import {InputAssignmentMap} from '#spec/topology-template'
import _ from 'lodash'

const cache: {[key: string]: InputAssignmentMap | undefined} = {}
const queue: {[key: string]: InputAssignmentMap[] | undefined} = {}
const running: {[key: string]: boolean | undefined} = {}
const stopped: {[key: string]: boolean | undefined} = {}

type InstancesAdaptationOptions = {instance: string; inputs: InputAssignmentMap}

/**
 * Monitor: Collect sensor data and trigger adaptation
 */
export default async function (options: InstancesAdaptationOptions) {
    if (stopped[options.instance]) return

    if (queue[options.instance]) return queue[options.instance]!.push(options.inputs)

    const instance = new Instance(options.instance)
    if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)

    queue[options.instance] = [options.inputs]
    emitter.emit(events.start_adaptation, instance)
}

/**
 * Adaptation Loop
 */
emitter.on(events.start_adaptation, async (instance: Instance) => {
    // Stop loop if there are no enqueued entries
    if (!validator.isDefined(queue[instance.getName()])) return
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
        // Get enqueued entries
        const entries = queue[instance.getName()]
        if (validator.isUndefined(entries)) throw new Error(`Values of instance "${instance.getName()}" are empty`)

        // Construct current variability inputs
        if (!cache[instance.getName()]) cache[instance.getName()] = instance.loadVariabilityInputs()
        _.merge(cache[instance.getName()], ...entries)

        // Reset queue
        delete queue[instance.getName()]

        /**
         * Analyze: Resolve variability
         */
        await resolve({
            instance: instance.getName(),
            inputs: cache[instance.getName()],
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
