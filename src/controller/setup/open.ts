import config from '#config'
import open from '#utils/open'

export default async function () {
    await open.file(config.home)
}
