import si from 'systeminformation'
import {SensorBaseOptions, human2cron, submit} from '#controller/sensors/utils'
import cron from 'node-cron'
import console from 'console'
import hae from '#utils/hae'
import {InputAssignmentMap} from '#spec/topology-template'

export type SensorComputeOptions = SensorBaseOptions & {template: string}

export default async function (options: SensorComputeOptions) {
    const system = await si.osInfo()
    if (system.platform.toLowerCase().startsWith('win')) throw new Error(`Windows is not supported`)

    cron.schedule(
        human2cron(options.timeInterval),
        hae.log(async () => {
            const load = await si.currentLoad()
            const mem = await si.mem()

            const inputs: InputAssignmentMap = {}
            inputs[`${options.template}_cpu_utilization`] = format(load.currentLoad)
            inputs[`${options.template}_memory_utilization`] = format(mem.used / mem.total)
            console.log(inputs)

            if (options.disableSubmission) return
            await submit(options.vintnerHost, options.vintnerHost, options.instance, inputs)
        })
    )
}

function format(value: number) {
    return (value * 100).toLocaleString('en', {maximumFractionDigits: 2, minimumFractionDigits: 2})
}
