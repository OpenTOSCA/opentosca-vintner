import {human2cron, SensorBaseOptions, submit} from '#controller/sensors/utils'
import cron from 'node-cron'
import hae from '#utils/hae'
import {InputAssignmentMap} from '#spec/topology-template'
import console from 'console'
import * as files from '#files'
import death from '#utils/death'

export type SensorFileOptions = SensorBaseOptions & {file: string; disableWatch?: boolean}

export default async function (options: SensorFileOptions) {
    async function handle() {
        const inputs = files.loadYAML<InputAssignmentMap>(options.file)
        console.log(inputs)

        if (options.disableSubmission) return
        await submit(options, inputs)
    }

    if (options.disableWatch) return await handle()

    const task = cron.schedule(
        human2cron(options.timeInterval),
        hae.log(async () => await handle())
    )
    task.start()
    death.register(task)
}
