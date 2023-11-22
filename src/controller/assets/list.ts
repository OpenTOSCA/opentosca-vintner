import {Assets} from '#repositories/assets'

export default async function () {
    return Assets.all()
}
