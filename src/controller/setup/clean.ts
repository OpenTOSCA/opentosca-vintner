import * as files from '../../utils/files'
import config from '../../utils/config'

export default async function () {
    files.removeDirectory(config.home)
}
