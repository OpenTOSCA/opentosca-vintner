import {human2cron, SensorBaseOptions, submit} from '#controller/sensors/utils'
import cron from 'node-cron'
import hae from '#utils/hae'
import {InputAssignmentMap} from '#spec/topology-template'
import console from 'console'
import * as files from '#files'

export type SensorFileOptions = SensorBaseOptions & {file: string; disableWatch?: boolean}

export default async function (options: SensorFileOptions) {
    if (options.disableWatch) return fn(options)

    cron.schedule(
        human2cron(options.timeInterval),
        hae.log(() => fn(options))
    )
}

async function fn(options: SensorFileOptions) {
    const inputs = files.loadYAML<InputAssignmentMap>(options.file)
    console.log(inputs)

    if (options.disableSubmission) return
    await submit(options.vintnerHost, options.vintnerHost, options.instance, inputs)
}
