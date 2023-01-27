import open from 'open'
import config from '#config'

export default async function () {
    await open(config.home)
}
