import {Instances} from '#repositories/instances'
import * as files from '#files'

export type InstancesCleanOptions = {}

export default async function (options: InstancesCleanOptions) {
    files.deleteDirectory(Instances.getInstancesDirectory())
}
