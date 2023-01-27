import * as files from '#files'
import config from '#config'

export default async function () {
    files.removeDirectory(config.home)
}
