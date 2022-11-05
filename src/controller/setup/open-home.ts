import open from 'open'
import config from '../../utils/config'

export default async function () {
    await open(config.home)
}
