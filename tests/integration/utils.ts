import Controller from '#controller'
import {xOperaNativeDefaults} from '#plugins/xopera'
import path from 'path'

export const examplesDir = path.join(__dirname, '..', '..', 'examples')

export const insideWorkflow = process.env.CI === 'true'
export const integrationTestsEnabled = insideWorkflow || process.env.ENABLE_INTEGRATION_TESTS === 'true'

export async function initSetup() {
    // TODO: set vintner home to not nuke local setups

    // Setup filesystem
    await Controller.setup.reset({force: true})

    // Setup xOpera
    if (insideWorkflow) {
        await Controller.orchestrators.initxOpera({venv: true, dir: xOperaNativeDefaults.dir})
        await Controller.orchestrators.enable({orchestrator: 'xopera'})
        await Controller.orchestrators.attest({orchestrator: 'xopera'})
    } else {
        await Controller.orchestrators.initxOperaWSL({venv: true, dir: xOperaNativeDefaults.dir})
        await Controller.orchestrators.enable({orchestrator: 'xopera-wsl'})
        await Controller.orchestrators.attest({orchestrator: 'xopera-wsl'})
    }
}

export async function cleanSetup() {
    // Cleanup filesystem
    await Controller.setup.clean({force: true})
}
