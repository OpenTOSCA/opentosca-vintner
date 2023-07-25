import * as assert from '#assert'
import config from '#config'
import * as files from '#files'
import {FilePlugin} from '#plugins/file'
import {UnfurlPlugin} from '#plugins/unfurl'
import {VintnerPlugin} from '#plugins/vintner'
import {WineryPlugin} from '#plugins/winery'
import {xOperaPlugin} from '#plugins/xopera'
import path from 'path'
import {OrchestratorsConfig} from './types'

const configPath = path.join(config.home, 'plugins.yaml')

function loadConfig() {
    return files.loadYAML<OrchestratorsConfig>(configPath)
}

function setConfig(config: OrchestratorsConfig) {
    files.storeYAML(configPath, config)
}

function getOrchestrator() {
    const config = loadConfig()

    switch (config.enabled) {
        case 'xopera':
            assert.isDefined(config.xOpera, 'xOpera is enabled but no config was found')
            return new xOperaPlugin({...config.xOpera, wsl: false})

        case 'xopera-wsl':
            assert.isDefined(config.xOperaWSL, 'xOperaWSL is enabled but no config was found')
            return new xOperaPlugin({...config.xOperaWSL, wsl: true})

        case 'unfurl':
            assert.isDefined(config.unfurl, 'Unfurl is enabled but no config was found')
            return new UnfurlPlugin({...config.unfurl, wsl: false})

        case 'unfurl-wsl':
            assert.isDefined(config.unfurlWSL, 'UnfurlWSL is enabled but no config was found')
            return new UnfurlPlugin({...config.unfurlWSL, wsl: true})

        case undefined:
            throw new Error('No orchestrator is enabled')

        default:
            throw new Error(`Orchestrator "${config.enabled}" is not supported`)
    }
}

function getTemplateRepository(name: string) {
    switch (name) {
        case 'file':
            return new FilePlugin()

        case 'vintner':
            return new VintnerPlugin()

        case 'winery':
            return new WineryPlugin()

        default:
            throw new Error(`Unknown templates plugin "${name}"`)
    }
}

function getLockKey() {
    return 'config:plugins'
}

export default {
    getLockKey,
    loadConfig,
    setConfig,
    getOrchestrator,
    getTemplateRepository,
}
