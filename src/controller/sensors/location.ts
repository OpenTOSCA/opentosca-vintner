import {human2cron, SensorBaseOptions, submit} from '#controller/sensors/utils'
import cron from 'node-cron'
import hae from '#utils/hae'
import axios from 'axios'
import {InputAssignmentMap} from '#spec/topology-template'
import console from 'console'

export type SensorLocationOptions = SensorBaseOptions & {template: string}

export default async function (options: SensorLocationOptions) {
    cron.schedule(
        human2cron(options.timeInterval),
        hae.log(async () => {
            const info: {
                city: string
                region: string
                country: string
                loc: string
                postal: string
            } = (await axios.get('https://ipinfo.io')).data

            const inputs: InputAssignmentMap = {}
            inputs[`${options.template}_city`] = info.city
            inputs[`${options.template}_region`] = info.region
            inputs[`${options.template}_country`] = info.country
            inputs[`${options.template}_postal`] = info.postal
            inputs[`${options.template}_latitude`] = info.loc.split(',')[0]
            inputs[`${options.template}_longitude`] = info.loc.split(',')[1]
            console.log(inputs)

            if (options.disableSubmission) return
            await submit(options.vintnerHost, options.vintnerHost, options.instance, inputs)
        })
    )
}
