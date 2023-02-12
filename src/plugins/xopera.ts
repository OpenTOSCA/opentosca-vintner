import {Instance} from '#repository/instances'
import {NodeTemplateAttributesMap, OrchestratorOperationOptions, OrchestratorPlugin} from './types'
import {joinNotNull} from '#utils'
import {Shell} from '#shell'
import * as files from '#files'
import _ from 'lodash'

export type xOperaConfig = (xOperaNativeConfig & {wsl: false}) | (xOperaWLSConfig & {wsl: true})

export type xOperaNativeConfig = {
    venv: boolean
    dir: string
}

export type xOperaWLSConfig = xOperaNativeConfig

export class xOperaPlugin implements OrchestratorPlugin {
    private readonly config: xOperaConfig
    private readonly binary: string
    private readonly shell: Shell

    constructor(config: xOperaConfig) {
        this.config = config
        this.binary = joinNotNull(
            [
                this.config.venv ? `cd ${this.config.dir}` : undefined,
                this.config.venv ? '. .venv/bin/activate' : undefined,
                'opera',
            ],
            ' && '
        )
        this.shell = new Shell(config.wsl)
    }

    async deploy(instance: Instance, options?: OrchestratorOperationOptions) {
        const command = [
            this.binary,
            'deploy',
            this.shell.resolve(instance.getServiceTemplate()),
            '--instance-path',
            this.shell.resolve(instance.getDataDirectory()),
        ]
        if (instance.hasServiceInputs()) command.push('--inputs', this.shell.resolve(instance.getServiceInputs()))
        if (options?.verbose) command.push('--verbose')
        await this.shell.execute(command)
    }

    async redeploy(instance: Instance, options?: OrchestratorOperationOptions) {
        const command = [
            this.binary,
            'deploy',
            '--resume',
            '--force',
            '--instance-path',
            this.shell.resolve(instance.getDataDirectory()),
        ]
        if (options?.verbose) command.push('--verbose')
        await this.shell.execute(command)
    }

    async update(instance: Instance, options?: OrchestratorOperationOptions) {
        const command = [
            this.binary,
            'update',
            this.shell.resolve(instance.getServiceTemplate(options?.time)),
            '--instance-path',
            this.shell.resolve(instance.getDataDirectory()),
        ]
        if (instance.hasServiceInputs()) command.push('--inputs', this.shell.resolve(instance.getServiceInputs()))
        if (options?.verbose) command.push('--verbose')
        await this.shell.execute(command)
    }

    async undeploy(instance: Instance, options?: OrchestratorOperationOptions) {
        const command = [
            this.binary,
            'undeploy',
            '--instance-path',
            this.shell.resolve(instance.getDataDirectory()),
            '--resume',
            '--force',
        ]
        if (options?.verbose) command.push('--verbose')
        await this.shell.execute(command)
    }

    /**
     * Returns attribute names and data for each node template
     */
    async getAttributes(instance: Instance) {
        const attributes: NodeTemplateAttributesMap = {}
        for (const node in instance.loadServiceTemplate().topology_template?.node_templates || {}) {
            const attributesPath = `${instance.getDataDirectory()}/instances/${node}_0`
            if (files.isFile(attributesPath)) {
                const entries = files.loadYAML<{[s: string]: {is_set: string; data: string}}>(attributesPath)
                for (const [key, value] of Object.entries(entries)) {
                    _.set(attributes, [node, 'attributes', key], value.data)
                }
            }
        }
        return attributes
    }
}
