import open from 'open'
import config from '../../cli/config'

export default async function () {
    await open(config.home)
}
