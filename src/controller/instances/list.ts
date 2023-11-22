import {Instances} from '#repositories/instances'

export default async function () {
    return Instances.all()
}
