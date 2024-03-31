import * as files from '#files'
import {Instances} from '#repositories/instances'

export type InstancesCleanOptions = {}

export default async function (options: InstancesCleanOptions) {
    files.removeDirectory(Instances.getInstancesDirectory())
}
