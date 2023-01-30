import {Instance} from '#repository/instances'
import update from '#controller/instances/update'
import resolve from '#controller/template/resolve'

type SensorData = {instance: string; key: string; value: string}

export default async function (options: SensorData) {
    const instance = new Instance(options.instance)
    if (!instance.exists()) throw new Error(`Instance "${instance.getName()}" does not exist`)

    /**
     * Monitor: Collect sensor data
     */
    // TODO: monitor: add sensor data

    /**
     * Analyze
     */
    // TODO: analyze: null

    // TODO: variabilityInputsPath
    const variabilityInputsPath = ''

    /**
     * Plan: Resolve variability
     */
    // TODO: preset
    await resolve({instance: instance.getName(), inputs: variabilityInputsPath})

    /**
     * Execute: Update deployment
     */
    await update({instance: instance.getName(), inputs: instance.getServiceInputsPath()})
}
