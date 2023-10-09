import {human2cron, prefix, SensorBaseOptions, submit} from '#controller/sensors/utils'
import std from '#std'
import death from '#utils/death'
import hae from '#utils/hae'
import axios from 'axios'
import cron from 'node-cron'

export type SensorLocationOptions = SensorBaseOptions & {template: string}

export default async function (options: SensorLocationOptions) {
    async function handle() {
        const info: {
            city: string
            region: string
            country: string
            loc: string
            postal: string
        } = (await axios.get('https://ipinfo.io')).data

        const inputs = prefix(
            {
                city: info.city,
                region: info.region,
                country: info.country,
                postal: info.postal,
                latitude: info.loc.split(',')[0],
                longitude: info.loc.split(',')[1],
            },
            options.template
        )
        std.log(inputs)

        if (options.disableSubmission) return
        await submit(options, inputs)
    }

    await handle()
    const task = cron.schedule(
        human2cron(options.timeInterval),
        hae.log(async () => {
            await handle()
        })
    )
    death.register(task)
}
