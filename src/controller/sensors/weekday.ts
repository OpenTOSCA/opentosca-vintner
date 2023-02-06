import {human2cron, SensorBaseOptions, submit} from '#controller/sensors/utils'
import cron from 'node-cron'
import hae from '#utils/hae'
import {InputAssignmentMap} from '#spec/topology-template'
import console from 'console'
import * as validator from '#validator'
import death from '#utils/death'

export type SensorWeekdayOptions = SensorBaseOptions & {start?: string}

const week = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

// TODO: tick directly
export default async function (options: SensorWeekdayOptions) {
    let index = new Date().getDay()
    if (validator.isDefined(options.start)) {
        index = week.findIndex(d => d === options.start)
        if (index === -1) throw new Error(`Did not find day "${options.start}"`)
    }

    const task = cron.schedule(
        human2cron(options.timeInterval),
        hae.log(async () => {
            const inputs: InputAssignmentMap = {weekday: week[index]}
            console.log(inputs)

            index = (index + 1) % 7

            if (options.disableSubmission) return
            await submit(options.vintnerHost, options.vintnerHost, options.instance, inputs)
        })
    )
    death.register(task)
}
