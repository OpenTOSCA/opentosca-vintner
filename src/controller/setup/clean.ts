import * as files from '../../utils/files'
import config from '../../cli/config'

export default async function () {
    files.removeDirectory(config.home)
}
