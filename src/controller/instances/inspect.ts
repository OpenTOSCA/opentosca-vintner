import {Instance} from '#repository/instances'

export type InspectArguments = {instance: string}

export default async function (options: InspectArguments) {
    return new Instance(options.instance).getServiceTemplate()
}
