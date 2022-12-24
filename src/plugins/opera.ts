import {Instance} from '#repository/instances'
import {OrchestratorPlugin} from '#repository/orchestrators'
import {joinNotNull} from '#utils'
import {Shell} from '#shell'
import * as files from '../utils/files'
import _ from 'lodash'
import {NodeTemplateAttributes, NodeTemplateAttributesMap, QueryInstancesPlugin} from '#/query/plugins'
import {InputAssignmentMap} from '#spec/topology-template'
import * as fs from 'fs'

export type OperaConfig = (OperaNativeConfig & {wsl: false}) | (OperaWLSConfig & {wsl: true})

export type OperaNativeConfig = {
    venv: boolean
    dir: string
}

export type OperaWLSConfig = OperaNativeConfig

export class Opera implements OrchestratorPlugin, QueryInstancesPlugin {
    private readonly config: OperaConfig
    private readonly binary: string
    private readonly shell: Shell

    constructor(config: OperaConfig) {
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

    async deploy(instance: Instance) {
        const command = [
            this.binary,
            'deploy',
            this.shell.resolve(instance.getServiceTemplatePath()),
            '--instance-path',
            this.shell.resolve(instance.getDataDirectory()),
        ]

        if (instance.hasServiceInput()) command.push('--inputs', this.shell.resolve(instance.getServiceInputPath()))
        await this.shell.execute(command)
    }

    async update(instance: Instance) {
        const command = [
            this.binary,
            'update',
            this.shell.resolve(instance.getServiceTemplatePath()),
            '--instance-path',
            this.shell.resolve(instance.getDataDirectory()),
        ]
        if (instance.hasServiceInput()) command.push('--inputs', this.shell.resolve(instance.getServiceInputPath()))

        await this.shell.execute(command)
    }

    async undeploy(instance: Instance) {
        await this.shell.execute([
            this.binary,
            'undeploy',
            '--instance-path',
            this.shell.resolve(instance.getDataDirectory()),
            '--resume',
            '--force',
        ])
    }

    getInputs(instance: Instance): InputAssignmentMap {
        const inputsPath = `${instance.getDataDirectory()}/inputs`
        return files.isFile(inputsPath) ? JSON.parse(fs.readFileSync(inputsPath, 'utf-8')) : {}
    }

    /**
     * Returns attribute names and data for each node template
     * @param instance
     */
    getAttributes(instance: Instance): NodeTemplateAttributesMap {
        const attributes: {[key: string]: NodeTemplateAttributes} = {}
        for (const node in instance.getServiceTemplate().topology_template?.node_templates || {}) {
            const attributesPath = `${instance.getDataDirectory()}/instances/${node}_0`
            if (files.isFile(attributesPath)) {
                const entries: {[s: string]: {is_set: string; data: string}} = files.loadYAML(attributesPath)
                for (const [attrKey, attrValue] of Object.entries(entries)) {
                    _.set(attributes, [node, 'attributes', attrKey], attrValue.data)
                }
            }
        }
        return attributes
    }
}
