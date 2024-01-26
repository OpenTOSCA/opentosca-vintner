import {OrchestratorsConfig} from '#/orchestrators'
import env from '#env'
import * as files from '#files'
import path from 'path'

// TODO: config is more than just orchestrators

class Config {
    private readonly file = path.join(env.home, 'plugins.yaml')
    readonly lock = 'misc:config'

    load() {
        return files.loadYAML<OrchestratorsConfig>(this.file)
    }

    set(config: OrchestratorsConfig) {
        files.storeYAML(this.file, config)
    }
}

export default new Config()
