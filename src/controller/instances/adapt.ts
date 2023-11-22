import * as check from '#check'
import Controller from '#controller'
import {Instance} from '#repositories/instances'
import Resolver from '#resolver'
import {InputAssignmentMap} from '#spec/topology-template'
import std from '#std'
import * as utils from '#utils'
import {emitter, events} from '#utils/emitter'
import hae from '#utils/hae'
import lock from '#utils/lock'
import jsonDiff from 'json-diff'
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
    std.log(options)
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
    if (!check.isDefined(queue[instance.getName()])) return
    // Stop current process if there is already another one running
    if (running[instance.getName()]) return
    // Stop loop if adaptation is stopped
    if (stopped[instance.getName()]) return

    running[instance.getName()] = true
    await lock.wait(
        instance.getLockKey(),
        hae.log(async () => {
            // Sanity
            if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)

            // Current time used as correlation identifier
            const time = utils.now()

            /**
             * Monitor: Store sensor data
             */
            // Get enqueued entries
            const entries = queue[instance.getName()]
            if (check.isUndefined(entries)) throw new Error(`Values of instance "${instance.getName()}" are empty`)

            // Construct current variability inputs
            if (!cache[instance.getName()]) cache[instance.getName()] = instance.loadVariabilityInputs()
            _.merge(cache[instance.getName()], ...entries)

            // Reset queue
            delete queue[instance.getName()]

            /**
             * Analyze: Resolve variability
             */
            const result = await Resolver.resolve({
                template: instance.loadVariableServiceTemplate(),
                inputs: cache[instance.getName()],
            })

            /**
             * Analyze: Check difference
             * Note, that current service template might have failed components, e.g, when the previous deployment did not succeed
             */
            const diff = jsonDiff.diffString(instance.loadServiceTemplate(), result.template)
            if (!diff) return std.log('There is no difference between the previous and adapted service templates.')
            std.log('The previous and adapted service templates differs as follows')
            std.log(diff)

            /**
             * Analyze and Execute: Update deployment
             */
            await instance.setServiceTemplate(result.template, time)
            await instance.setVariabilityInputs(result.inputs, time)
            instance.setResolvedTimestamp(time)
            await Controller.instances.update({
                instance: instance.getName(),
                time,
            })
        })
    )
    running[instance.getName()] = false
    emitter.emit(events.start_adaptation, instance)
})

/**
 * Stop adaptation, e.g., before undeployment
 */
emitter.on(events.stop_adaptation, (instance: Instance) => {
    stopped[instance.getName()] = true
})
