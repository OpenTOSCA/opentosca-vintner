import * as files from '../utils/files'
import path from 'path'
import config from '../cli/config'
import {Opera, OperaNativeConfig, OperaWLSConfig} from '../orchestrators/opera'
import {Unfurl, UnfurlNativeConfig, UnfurlWSLConfig} from '../orchestrators/unfurl'
import {Instance} from './instances'
import * as validator from '../utils/validator'

export interface Orchestrator {
    deploy: (instance: Instance) => Promise<void>
    update: (instance: Instance) => Promise<void>
    undeploy: (instance: Instance) => Promise<void>
}

export type OrchestratorsConfig = {
    enabled?: string
    opera?: OperaNativeConfig
    operaWSL?: OperaWLSConfig
    unfurl?: UnfurlNativeConfig
    unfurlWSL?: UnfurlWSLConfig
}

export class Orchestrators {
    static getConfigPath() {
        return path.join(config.home, 'orchestrators.yaml')
    }

    static getConfig() {
        return files.loadFile<OrchestratorsConfig>(this.getConfigPath())
    }

    static setConfig(config: OrchestratorsConfig) {
        files.storeFile(Orchestrators.getConfigPath(), config)
    }

    static getOrchestrator() {
        const config = Orchestrators.getConfig()

        switch (config.enabled) {
            case 'opera':
                validator.ensureDefined(config.opera, 'Opera is enabled but no config was found')
                return new Opera({...config.opera, wsl: false})

            case 'opera-wsl':
                validator.ensureDefined(config.operaWSL, 'OperaWSL is enabled but no config was found')
                return new Opera({...config.operaWSL, wsl: true})

            case 'unfurl':
                validator.ensureDefined(config.unfurl, 'Unfurl is enabled but no config was found')
                return new Unfurl({...config.unfurl, wsl: false})

            case 'unfurl-wsl':
                validator.ensureDefined(config.unfurlWSL, 'UnfurlWSL is enabled but no config was found')
                return new Unfurl({...config.unfurlWSL, wsl: true})

            case undefined:
                throw new Error('No orchestrator is enabled')

            default:
                throw new Error(`Orchestrator "${config.enabled}" is not supported`)
        }
    }
}
