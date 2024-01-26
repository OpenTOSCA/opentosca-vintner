import env from '#utils/env'
import open from '#utils/open'

export default async function () {
    return open.code(env.home)
}
