import env from '#utils/env'
import open from '#utils/open'

export default async function () {
    await open.file(env.home)
}
