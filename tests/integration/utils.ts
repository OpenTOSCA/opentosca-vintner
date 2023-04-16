import Controller from '../../src/controller'
import {Shell} from '#shell'
import path from 'path'

export const examplesDir = path.join(__dirname, '..', '..', 'examples')

export const insideWorkflow = process.env.CI === 'true'
export const integrationTestsEnabled = insideWorkflow || process.env.ENABLE_INTEGRATION_TESTS === 'true'

export async function checkSetup() {
    // Check that xOpera is installed
    if (insideWorkflow) {
        await new Shell().execute(['which opera &>/dev/null'])
    } else {
        await new Shell(true).execute(['cd ~/opera', '&&', '. .venv/bin/activate', '&&', 'which opera &>/dev/null'])
    }
}

export async function initSetup() {
    // TODO: set vintner home to not nuke local setups

    // Setup filesystem
    await Controller.setup.clean()
    await Controller.setup.init()

    // Setup xOpera
    if (insideWorkflow) {
        await Controller.orchestrators.initxOpera({venv: false, dir: 'none'})
        await Controller.orchestrators.enable({orchestrator: 'xopera'})
    } else {
        await Controller.orchestrators.initxOperaWSL({venv: true, dir: '~/opera'})
        await Controller.orchestrators.enable({orchestrator: 'xopera-wsl'})
    }
}

export async function cleanSetup() {
    // Cleanup filesystem
    await Controller.setup.clean()
}
