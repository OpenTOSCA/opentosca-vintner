import {human2cron, prefix, SensorBaseOptions, submit} from '#controller/sensors/utils'
import cron from 'node-cron'
import hae from '#utils/hae'
import axios from 'axios'
import console from 'console'
import death from '#utils/death'

export type SensorLocationOptions = SensorBaseOptions & {template: string}

export default async function (options: SensorLocationOptions) {
    const task = cron.schedule(
        human2cron(options.timeInterval),
        hae.log(async () => {
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
            console.log(inputs)

            if (options.disableSubmission) return
            await submit(options.vintnerHost, options.vintnerPort, options.instance, inputs)
        })
    )
    death.register(task)
}
