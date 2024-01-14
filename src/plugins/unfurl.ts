import * as files from '#files'
import {OrchestratorOperationOptions, OrchestratorPlugin} from '#plugins/types'
import {Instance} from '#repositories/instances'
import {Shell} from '#shell'
import * as utils from '#utils'
import path from 'path'

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

export class UnfurlPlugin implements OrchestratorPlugin {
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
    async validate(instance: Instance, options?: OrchestratorOperationOptions) {
        const tmp = files.temporary()
        files.createDirectory(tmp)
        await this.createEnsemble(instance, tmp)

        // TODO: handle --inputs. maybe via service-inputs.tmp.yaml or something?

        const command = [this.binary, 'validate', this.shell.resolve(tmp)]
        if (options?.verbose) command.push('--verbose')
        await this.shell.execute(command)

        files.deleteDirectory(tmp)
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

    getAttributes(instance: Instance) {
        return Promise.reject('Not Implemented')
    }

    private async createEnsemble(instance: Instance, dir?: string) {
        const dataDirectory = dir ?? instance.getDataDirectory()
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
        // TODO: but this is required during deployment
        if (instance.hasServiceInputs()) files.copy(instance.getServiceInputs(), ensembleInputsFile)
    }
}
