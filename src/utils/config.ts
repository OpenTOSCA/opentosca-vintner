import path from 'path'
import os from 'os'

class Config {
    version = '__VERSION__'
    home!: string

    libDir = 'lib'
    packageCacheDir!: string
    dependencyFile = 'dependencies.yaml'

    constructor() {
        this.load()
    }

    load() {
        this.home = path.resolve(
            process.env.OPENTOSCA_VINTNER_HOME_DIR || path.join(os.homedir(), '.opentosca_vintner')
        )
        this.packageCacheDir = path.join(this.home, 'package-cache')
    }
}

export default new Config()
