import * as check from '#check'
import * as files from '#files'
import {ASSETS_DIR} from '#files'
import {Instance} from '#repositories/instances'
import {Shell} from '#shell'
import * as utils from '#utils'
import platform from '#utils/platform'
import path from 'path'
import {
    Orchestrator,
    OrchestratorDebugOptions,
    OrchestratorOperationOptions,
    OrchestratorValidateOptions,
} from './index'

export type UnfurlConfig = (UnfurlNativeConfig & {wsl: false}) | (UnfurlWSLConfig & {wsl: true})

export type UnfurlNativeConfig = {
    venv: boolean
    dir: string
}

export const UnfurlNativeDefaults: UnfurlNativeConfig = {
    venv: true,
    dir: '~/unfurl',
}

export type UnfurlWSLConfig = UnfurlNativeConfig

export const UnfurlWSLDefaults: UnfurlWSLConfig = UnfurlNativeDefaults

export class Unfurl implements Orchestrator {
    private readonly config: UnfurlConfig
    private readonly binary: string
    private readonly shell: Shell

    constructor(config: UnfurlConfig) {
        this.config = config
        this.binary = utils.joinNotNull(
            [
                this.config.venv ? `cd ${this.config.dir}` : undefined,
                this.config.venv ? '. .venv/bin/activate' : undefined,
                'unfurl',
            ],
            ' && '
        )
        this.shell = new Shell(config.wsl)
    }

    async attest() {
        await this.shell.execute([this.binary, 'version'])
    }

    /**
     * https://docs.unfurl.run/cli.html#unfurl-validate
     */
    async validate(instance: Instance, options?: OrchestratorValidateOptions) {
        const tmp = files.temporaryDirent()
        files.createDirectory(tmp)
        await this.createEnsemble(instance, {dir: tmp, inputs: options?.inputs})

        const command = [this.binary, 'validate', this.shell.resolve(tmp)]
        if (options?.verbose) command.push('--verbose')
        await this.shell.execute(command)

        /**
         * Clean up only on Linux.
         * On Windows the following error is thrown:
         * Error: EPERM: operation not permitted, unlink '\\?\C:\Users\stoetzms\AppData\Local\Temp\opentosca-vintner--07c9d77e-07ac-4431-9621-1ff61e8f7dc3\tosca_repositories\spec'
         */
        if (platform.linux) files.removeDirectory(tmp)
    }

    /**
     * https://docs.unfurl.run/cli.html#unfurl-deploy
     */
    async deploy(instance: Instance, options?: OrchestratorOperationOptions) {
        await this.createEnsemble(instance)
        const command = [
            this.binary,
            'deploy',
            '--approve',
            '--jobexitcode error',
            this.shell.resolve(instance.getDataDirectory()),
        ]
        if (options?.verbose) command.push('--verbose')
        await this.shell.execute(command)
    }

    async outputs(instance: Instance) {
        return Promise.reject('Not Supported')
    }

    /**
     * https://docs.unfurl.run/cli.html#unfurl-undeploy
     */
    async undeploy(instance: Instance, options?: OrchestratorOperationOptions) {
        const command = [
            this.binary,
            'undeploy',
            '--approve',
            '--jobexitcode error',
            this.shell.resolve(instance.getDataDirectory()),
        ]
        if (options?.verbose) command.push('--verbose')
        await this.shell.execute(command)
    }

    async update(instance: Instance) {
        return Promise.reject('Not Implemented')
    }

    /**
     * https://docs.unfurl.run/cli.html#unfurl-deploy
     */
    async continue(instance: Instance, options?: OrchestratorOperationOptions) {
        const command = [
            this.binary,
            'deploy',
            '--approve',
            '--jobexitcode error',
            this.shell.resolve(instance.getDataDirectory()),
        ]
        if (options?.verbose) command.push('--verbose')
        await this.shell.execute(command)
    }

    async debug(instance: Instance, options: OrchestratorDebugOptions) {
        const command = [this.binary, options.command]
        const env = {
            INSTANCE_DATA_DIR: this.shell.resolve(instance.getDataDirectory()),
        }
        await this.shell.execute(command, {env})
    }

    getAttributes(instance: Instance) {
        return Promise.reject('Not Implemented')
    }

    private async createEnsemble(instance: Instance, options: {dir?: string; inputs?: string} = {}) {
        const dataDirectory = options.dir ?? instance.getDataDirectory()
        const ensembleDirectory = path.join(dataDirectory, 'ensemble')
        const ensembleFile = path.join(ensembleDirectory, 'ensemble.yaml')
        const ensembleFileContent = `apiVersion: unfurl/v1alpha1
kind: Ensemble
spec:
  inputs:
    +?include: service-inputs.yaml
  service_template:
    +include: ${instance.getServiceTemplateFile()}`
        const ensembleInputsFile = path.join(ensembleDirectory, 'service-inputs.yaml')

        await this.shell.execute([this.binary, 'init', '--empty', this.shell.resolve(dataDirectory)])
        files.storeYAML(ensembleFile, ensembleFileContent)
        files.copy(instance.getTemplateDirectory(), ensembleDirectory)

        // Vintner utils
        files.copy(path.join(ASSETS_DIR, 'unfurl', 'vintner_utils.py'), path.join(dataDirectory, 'vintner_utils.py'))

        // This is messy: use options.inputs for validating and instance.hasVariabilityInputs for deployment
        const inputs = options.inputs ?? (instance.hasServiceInputs() ? instance.getServiceInputs() : undefined)
        if (check.isDefined(inputs)) files.copy(inputs, ensembleInputsFile)
    }
}
