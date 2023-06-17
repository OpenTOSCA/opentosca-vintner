import config from '#config'
import * as files from '#files'

export default async function () {
    files.removeDirectory(config.home)
}
