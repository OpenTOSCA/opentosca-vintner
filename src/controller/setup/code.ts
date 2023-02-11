import config from '#config'
import open from '#utils/open'

export default async function () {
    return open.code(config.home)
}
