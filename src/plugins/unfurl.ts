import {Instance} from '#repository/instances'
import * as files from '#files'
import path from 'path'
import {joinNotNull} from '#utils'
import {Shell} from '#shell'
import {OrchestratorPlugin} from '#plugins/types'

export type UnfurlConfig = (UnfurlNativeConfig & {wsl: false}) | (UnfurlWSLConfig & {wsl: true})

export type UnfurlNativeConfig = {
    venv: boolean
    dir: string
}

export type UnfurlWSLConfig = UnfurlNativeConfig

export class UnfurlPlugin implements OrchestratorPlugin {
    private readonly config: UnfurlConfig
    private readonly shell: Shell

    constructor(config: UnfurlConfig) {
        this.config = config
        this.shell = new Shell(config.wsl)
    }

    async deploy(instance: Instance) {
        await this.shell.execute([this.getBinary(instance), 'init', '--empty', '.'])
        files.storeYAML(this.getEnsemblePath(instance), this.getEnsemble(instance))
        files.copy(instance.getTemplateDirectory(), this.getEnsembleDirectory(instance))
        files.copy(instance.getServiceInputs(), this.getEnsembleInputsPath(instance))
        await this.shell.execute([this.getBinary(instance), 'deploy', '--approve'])
    }

    async undeploy(instance: Instance) {
        await this.shell.execute([this.getBinary(instance), 'undeploy', '--approve'])
    }

    update(instance: Instance) {
        return Promise.reject('Not Implemented')
    }

    getBinary(instance: Instance) {
        return joinNotNull(
            [
                this.config.venv ? `cd ${this.config.dir}` : undefined,
                this.config.venv ? '. .venv/bin/activate' : undefined,
                `cd ${this.shell.resolve(instance.getDataDirectory())}`,
                'unfurl',
            ],
            ' && '
        )
    }

    getEnsembleDirectory(instance: Instance) {
        return path.join(instance.getDataDirectory(), 'ensemble')
    }

    getEnsembleInputsPath(instance: Instance) {
        return path.join(this.getEnsembleDirectory(instance), 'service-inputs.yaml')
    }

    getEnsemblePath(instance: Instance) {
        return path.join(this.getEnsembleDirectory(instance), 'ensemble.yaml')
    }

    getEnsemble(instance: Instance) {
        return `apiVersion: unfurl/v1alpha1
kind: Ensemble
spec:
  inputs:
    +?include: service-inputs.yaml
  service_template:
    +include: ${instance.getServiceTemplateFile()}`
    }

    getInputs(instance: Instance) {
        return Promise.reject('Not Implemented')
    }

    getAttributes(instance: Instance) {
        return Promise.reject('Not Implemented')
    }
}
