import os from 'os'
import path from 'path'

type Env = {
    version: string
    home: string
}

const env: Env = {
    // This string is replaced during the release workflow with the current commit hash
    version: '__VERSION__',
    home: path.resolve(process.env.OPENTOSCA_VINTNER_HOME_DIR || path.join(os.homedir(), '.opentosca_vintner')),
}
export default env
