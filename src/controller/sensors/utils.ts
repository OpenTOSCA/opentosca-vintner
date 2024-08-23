import * as check from '#check'
import {InputAssignmentMap} from '#spec/topology-template'
import axios from 'axios'
import friendlyNodeCron from 'friendly-node-cron'

export type SensorBaseOptions = {
    vintner: string
    instance: string
    timeInterval: string
    submission: boolean
}

export function human2cron(value: string) {
    const output = friendlyNodeCron(value)
    if (check.isUndefined(output)) throw new Error(`Cron pattern "${value}" not valid`)
    return output
}

export async function submit(options: SensorBaseOptions, inputs: InputAssignmentMap) {
    // TODO: some random sleep (but ensure no overlap) to prevent hard spikes
    await axios.post(`${options.vintner}/instances/adapt`, {
        instance: options.instance,
        inputs,
    })
}

export function prefix(data: InputAssignmentMap, key: string) {
    return Object.entries(data).reduce<InputAssignmentMap>((acc, cur) => {
        acc[`${key}_${cur[0]}`] = cur[1]
        return acc
    }, {})
}
