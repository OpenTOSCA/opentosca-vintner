import path from 'path'
import os from 'os'

type Config = {
    version: string
    home: string
}

const config: Config = {
    // This string is replaced during the release workflow with the current commit hash
    version: '__VERSION__',
    home: path.resolve(process.env.OPENTOSCA_VINTNER_HOME_DIR || path.join(os.homedir(), '.opentosca_vintner')),
}
export default config
