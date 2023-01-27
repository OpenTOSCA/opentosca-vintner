import {Instances} from '#repository/instances'

export default async function () {
    return Instances.all()
}
