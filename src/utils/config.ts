import {OrchestratorsConfig} from '#/orchestrators'
import env from '#env'
import * as files from '#files'
import path from 'path'

type Data = OrchestratorsConfig

class Config {
    private readonly file = path.join(env.home, 'config.yaml')
    readonly lock = 'misc:config'

    load() {
        return files.loadYAML<Data>(this.file)
    }

    set(config: Data) {
        files.storeYAML(this.file, config)
    }
}

export default new Config()
