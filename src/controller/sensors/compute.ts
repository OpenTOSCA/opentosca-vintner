import si from 'systeminformation'
import {SensorBaseOptions} from '#controller/sensors/utils'
import cron from 'node-cron'
import console from 'console'
import hae from '#utils/hae'

export type SensorComputeOptions = SensorBaseOptions

export default async function (options: SensorComputeOptions) {
    const system = await si.osInfo()
    if (system.platform.toLowerCase().startsWith('win')) throw new Error(`Windows is not supported`)

    // TODO: human-to-cron
    cron.schedule(
        options.time_interval || '* * * * * *',
        hae.log(async () => {
            // TODO: catch error
            const load = await si.currentLoad()
            const mem = await si.mem()
            console.log({
                cpu: format(load.currentLoad),
                mem: format(mem.used / mem.total),
            })
            // TODO: get host metrics and send them to vintner
        })
    )
}

function format(value: number) {
    return (value * 100).toLocaleString('en', {maximumFractionDigits: 2, minimumFractionDigits: 2})
}
