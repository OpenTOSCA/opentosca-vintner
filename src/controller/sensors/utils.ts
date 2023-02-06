// @ts-ignore
import _human2cron from 'friendly-node-cron'
import * as validator from '#validator'
import axios from 'axios'
import {InputAssignmentMap} from '#spec/topology-template'

export type SensorBaseOptions = {
    vintnerHost: string
    vintnerPort: string
    instance: string
    timeInterval: string
    disableSubmission: string
}

export function human2cron(value: string) {
    const output = _human2cron(value)
    if (validator.isUndefined(output)) throw new Error(`Cron pattern "${value}" not valid`)
    return output
}

export async function submit(host: string, port: string, instance: string, inputs: InputAssignmentMap) {
    // TODO: some random sleep (but ensure no overlap) to prevent hard spikes
    await axios.post(`http://${host}:${port}/instances/adapt`, {
        instance,
        inputs,
    })
}

export function prefix(data: InputAssignmentMap, prefix: string) {
    return Object.entries(data).reduce<InputAssignmentMap>((acc, cur) => {
        acc[`${prefix}_${cur[0]}`] = cur[1]
        return acc
    }, {})
}
