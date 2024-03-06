import * as check from '#check'
import * as files from '#files'
import {Instance} from '#repositories/instances'
import {Shell} from '#shell'
import std from '#std'
import * as utils from '#utils'
import _ from 'lodash'
import {
    NodeTemplateAttributesMap,
    Orchestrator,
    OrchestratorOperationOptions,
    OrchestratorValidateOptions,
} from './index'

export type xOperaConfig = (xOperaNativeConfig & {wsl: false}) | (xOperaWSLConfig & {wsl: true})

export type xOperaNativeConfig = {
    venv: boolean
    dir: string
}

export const xOperaNativeDefaults: xOperaNativeConfig = {
    venv: true,
    dir: '~/opera',
}

export type xOperaWSLConfig = xOperaNativeConfig

export const xOperaWSLDefaults: xOperaWSLConfig = xOperaNativeDefaults

export class xOpera implements Orchestrator {
    private readonly config: xOperaConfig
    private readonly binary: string
    private readonly shell: Shell

    constructor(config: xOperaConfig) {
        this.config = config
        this.binary = utils.joinNotNull(
            [
                this.config.venv ? `cd ${this.config.dir}` : undefined,
                this.config.venv ? '. .venv/bin/activate' : undefined,
                'opera',
            ],
            ' && '
        )
        this.shell = new Shell(config.wsl)
    }

    async attest() {
        await this.shell.execute([this.binary, '--version'])
    }

    async validate(instance: Instance, options?: OrchestratorValidateOptions) {
        const command = [
            this.binary,
            'validate',
            this.shell.resolve(instance.getServiceTemplate()),
            '--instance-path',
            this.shell.resolve(instance.getDataDirectory()),
        ]

        if (check.isDefined(options) && check.isDefined(options.inputs))
            command.push('--inputs', this.shell.resolve(options.inputs))

        if (options?.verbose) command.push('--verbose')
        if (options?.dry) command.push('--executors')

        await this.shell.execute(command)
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

    async outputs(instance: Instance, options?: OrchestratorOperationOptions) {
        const command = [this.binary, 'outputs', '--instance-path', this.shell.resolve(instance.getDataDirectory())]
        if (options?.verbose) command.push('--verbose')
        await this.shell.execute(command)
    }

    async continue(instance: Instance, options?: OrchestratorOperationOptions) {
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
        const attributes = await this.getAttributes(instance)

        try {
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
        } catch (e) {
            std.log(e)
        } finally {
            std.log('Will try to hotfix https://github.com/xlab-si/xopera-opera/issues/262')

            // Add lost public_address back to node instance
            // This is a hotfix for https://github.com/xlab-si/xopera-opera/issues/262 and is not reliable
            for (const [node, nodeAttributes] of Object.entries(attributes)) {
                if (check.isString(nodeAttributes.attributes.public_address)) {
                    std.log(`Node "${node}" has public address "${nodeAttributes.attributes.public_address}"`)
                    const nodePath = this.getNodeInstance(instance, node)
                    if (files.isFile(nodePath)) {
                        const nodeInstance = files.loadYAML<xOperaInstance>(nodePath)
                        nodeInstance.public_address = {is_set: true, data: nodeAttributes.attributes.public_address}
                        files.storeJSON(nodePath, nodeInstance)
                    }
                }
            }

            await this.continue(instance, options)
        }
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
            const attributesPath = this.getNodeInstance(instance, node)
            if (files.isFile(attributesPath)) {
                const entries = files.loadYAML<xOperaInstance>(attributesPath)
                for (const [key, value] of Object.entries(entries)) {
                    _.set(attributes, [node, 'attributes', key], value.data)
                }
            }
        }
        return attributes
    }

    private getNodeInstance(instance: Instance, name: string) {
        return `${instance.getDataDirectory()}/instances/${name}_0`
    }
}

type xOperaInstance = {[s: string]: xOperaAttribute}
type xOperaAttribute = {is_set: boolean; data: string}
