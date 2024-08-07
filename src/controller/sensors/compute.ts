import * as assert from '#assert'
import * as check from '#check'
import {SensorBaseOptions, human2cron, prefix, submit} from '#controller/sensors/utils'
import std from '#std'
import * as utils from '#utils'
import death from '#utils/death'
import hae from '#utils/hae'
import cron from 'node-cron'
import si from 'systeminformation'

export default async function (options: SensorComputeOptions) {
    const sensor = new SensorCompute(options)
    await sensor.start()
}

type HistoryEntry = {
    value: number
    time: number
}

let cpu_history: HistoryEntry[] = []
let mem_history: HistoryEntry[] = []

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
    sender: cron.ScheduledTask | undefined
    collector: cron.ScheduledTask | undefined
    time: number | undefined

    constructor(options: SensorComputeOptions) {
        this.options = options
        death.register(this)
    }

    async start() {
        this.time = utils.now()

        assert.isLinux()

        await this.collect()
        this.collector = cron.schedule(
            human2cron('every 2 seconds'),
            hae.log(async () => {
                await this.collect()
            })
        )

        await this.send()
        this.sender = cron.schedule(
            human2cron(this.options.timeInterval),
            hae.log(async () => {
                await this.send()
            })
        )
    }

    async collect() {
        const now = utils.now()

        const info = await si.get({
            currentLoad: 'currentLoad',
            mem: 'total,used',
        })

        const cpu = info.currentLoad.currentLoad
        const mem = (info.mem.used / info.mem.total) * 100

        cpu_history.push({value: cpu, time: now})
        cpu_history = clean(cpu_history, now)

        mem_history.push({value: mem, time: now})
        mem_history = clean(mem_history, now)
    }

    async send() {
        if (check.isUndefined(this.time)) throw new Error('Sensor has not been started')
        const uptime = Math.round((utils.now() - this.time) / 1000)
        const cpu = getAverage(cpu_history)
        const mem = getAverage(mem_history)

        await this.handle({
            up: true,
            uptime,
            cpu: utils.toFixed(cpu),
            memory: utils.toFixed(mem),
        })
    }

    async stop() {
        if (check.isDefined(this.sender)) this.sender.stop()
        if (check.isDefined(this.collector)) this.collector.stop()
        await this.handle({
            up: false,
            uptime: 0,
            cpu: 0,
            memory: 0,
        })
    }

    async handle(data: SensorComputeData) {
        const inputs = prefix(data, this.options.template)
        std.log(inputs)

        if (this.options.submission) return
        await submit(this.options, inputs)
    }
}

function getAverage(entries: HistoryEntry[]) {
    if (entries.length === 0) return 0
    return (
        entries.reduce((sum, entry) => {
            sum += entry.value
            return sum
        }, 0) / entries.length
    )
}

function clean(entries: HistoryEntry[], now: number) {
    const ago = now - 5 * 60 * 1000
    const index = entries.findIndex(entry => entry.time > ago)
    if (index === -1) return []
    if (index === 0) return entries
    return entries.slice(index)
}
