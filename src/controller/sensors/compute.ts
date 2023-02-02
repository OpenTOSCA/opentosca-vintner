import si from 'systeminformation'

export type SensorComputeOptions = {vintner_host: string; vintner_port: string; interval?: number}

export default async function (options: SensorComputeOptions) {
    const system = await si.osInfo()
    if (system.platform.startsWith('win')) throw new Error(`Windows is not supported`)

    setInterval(async () => {
        const load = await si.currentLoad()
        const mem = await si.mem()
        console.log({
            cpi: load.currentLoad,
            mem: format(mem.used / mem.total),
        })
        // TODO: get host metrics and send them to vintner
    }, options.interval || 1000)
}

function format(value: number) {
    return (value * 100).toLocaleString('en', {maximumFractionDigits: 2, minimumFractionDigits: 2})
}
