import * as files from '#files'
import {Instances} from '#repository/instances'

export type InstancesCleanOptions = {}

export default async function (options: InstancesCleanOptions) {
    files.deleteDirectory(Instances.getInstancesDirectory())
}
