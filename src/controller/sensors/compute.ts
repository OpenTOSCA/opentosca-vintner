import si from 'systeminformation'
import {SensorBaseOptions, human2cron, submit, prefix} from '#controller/sensors/utils'
import cron from 'node-cron'
import console from 'console'
import hae from '#utils/hae'
import * as validator from '#validator'
import death from '#utils/death'

// TODO: first tick is strange

export type SensorComputeData = {
    // Is running
    up: boolean
    // Seconds since started
    uptime: number
    // Current load of CPU in percentage
    cpu: number
    // Current load of memory in percentage
    memory: number
}
export type SensorComputeOptions = SensorBaseOptions & {template: string}

class SensorCompute {
    options: SensorComputeOptions
    task: cron.ScheduledTask | undefined

    constructor(options: SensorComputeOptions) {
        this.options = options
        death.register(this)
    }

    async start() {
        const start = new Date().getTime()

        const system = await si.osInfo()
        if (system.platform.toLowerCase().startsWith('win')) throw new Error(`Windows is not supported`)

        this.task = cron.schedule(
            human2cron(this.options.timeInterval),
            hae.log(async () => {
                // TODO: these data are not as expected
                const load = await si.currentLoad()
                const mem = await si.mem()
                const uptime = Math.round((new Date().getTime() - start) / 1000)

                await this.handle({
                    up: true,
                    uptime,
                    cpu: format(load.currentLoad),
                    memory: format(mem.used / mem.total),
                })
            })
        )
        this.task.start()
    }

    async handle(data: SensorComputeData) {
        const inputs = prefix(data, this.options.template)
        console.log(inputs)

        if (this.options.disableSubmission) return
        await submit(this.options, inputs)
    }

    async stop() {
        if (validator.isDefined(this.task)) this.task.stop()
        await this.handle({
            up: false,
            uptime: 0,
            cpu: 0,
            memory: 0,
        })
    }
}

export default async function (options: SensorComputeOptions) {
    const sensor = new SensorCompute(options)
    await sensor.start()
}

function format(value: number) {
    return Number((value * 100).toFixed(2))
}
