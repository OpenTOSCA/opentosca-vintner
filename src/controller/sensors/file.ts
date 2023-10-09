import {human2cron, SensorBaseOptions, submit} from '#controller/sensors/utils'
import * as files from '#files'
import {InputAssignmentMap} from '#spec/topology-template'
import std from '#std'
import death from '#utils/death'
import hae from '#utils/hae'
import cron from 'node-cron'

export type SensorFileOptions = SensorBaseOptions & {file: string; disableWatch?: boolean}

export default async function (options: SensorFileOptions) {
    async function handle() {
        const inputs = files.loadYAML<InputAssignmentMap>(options.file)
        std.log(inputs)

        if (options.disableSubmission) return
        await submit(options, inputs)
    }

    if (options.disableWatch) return await handle()

    await handle()
    const task = cron.schedule(
        human2cron(options.timeInterval),
        hae.log(async () => await handle())
    )
    death.register(task)
}
