import * as path from 'path'
import config from '#config'
import * as files from '#files'
import {ServiceTemplate} from '#spec/service-template'
import {Template} from './templates'
import _ from 'lodash'
import {InputAssignmentMap} from '#spec/topology-template'
import Plugins from '#plugins'
import * as utils from '#utils'
import * as validator from '#validator'
import * as featureIDE from '#utils/feature-ide'

export class Instances {
    static all() {
        return files.listDirectories(Instances.getInstancesDirectory()).map(name => new Instance(name))
    }

    static getInstancesDirectory() {
        return path.join(config.home, 'instances')
    }
}

export class Instance {
    private readonly _name: string

    constructor(name: string) {
        this._name = name
    }

    getName() {
        return this._name
    }

    exists() {
        return files.exists(this.getInstanceDirectory())
    }

    create() {
        files.createDirectory(this.getInstanceDirectory())
        files.createDirectory(this.getDataDirectory())
        return this
    }

    delete() {
        files.removeDirectory(this.getInstanceDirectory())
        return this
    }

    setTemplate(name: string) {
        files.copy(new Template(name).getTemplateDirectory(), this.getTemplateDirectory())
        return this
    }

    setServiceInputs(path: string) {
        files.copy(path, this.getServiceInputs())
        return this
    }

    getInstanceDirectory() {
        return path.join(Instances.getInstancesDirectory(), this._name)
    }

    getTemplateDirectory() {
        return path.join(this.getInstanceDirectory(), 'template')
    }

    getDataDirectory() {
        return path.join(this.getInstanceDirectory(), 'data')
    }

    /**
     * Retrieves the attributes of this instance from the active orchestrator, then merges them into the template
     */
    getInstanceTemplate(): ServiceTemplate {
        // TODO: does not handle relationships
        const template = this.loadServiceTemplate()
        const attributes = Plugins.getOrchestrator().getAttributes(this)
        const inputs = this.hasServiceInputs() ? this.loadServiceInputs() : {}
        if (template.topology_template?.node_templates) {
            template.topology_template.node_templates = _.merge(template.topology_template.node_templates, attributes)
        }
        _.set(template, 'topology_template.inputs', inputs)
        return template
    }

    hasServiceInputs() {
        return files.exists(this.getServiceInputs())
    }

    getServiceInputs() {
        return path.join(this.getInstanceDirectory(), 'service-inputs.yaml')
    }

    loadServiceInputs() {
        return files.loadYAML<InputAssignmentMap>(this.getServiceInputs())
    }

    generateServiceTemplatePath(id?: string) {
        return this.getServiceTemplate(id || utils.getTime())
    }

    getServiceTemplateID() {
        const id = Math.max(
            ...files
                .listFiles(this.getTemplateDirectory())
                .map(file => file.match(/^service-template\.(?<id>\d+)\.yaml$/)?.groups?.id)
                .filter(Boolean)
                .map(Number)
        )
        if (id === -Infinity) throw new Error('Did not find a service template')
        return id.toString()
    }

    getServiceTemplateFile(id?: string) {
        return `service-template.${id || this.getServiceTemplateID()}.yaml`
    }

    getServiceTemplate(id?: string) {
        return path.join(this.getTemplateDirectory(), this.getServiceTemplateFile(id))
    }

    loadServiceTemplate() {
        return files.loadYAML<ServiceTemplate>(this.getServiceTemplate())
    }

    getVariableServiceTemplate() {
        return path.join(this.getTemplateDirectory(), 'variable-service-template.yaml')
    }

    loadVariableServiceTemplate() {
        return files.loadYAML<ServiceTemplate>(this.getVariableServiceTemplate())
    }

    hasVariabilityInputs() {
        return files.exists(this.getVariabilityInputs())
    }

    getVariabilityInputs(id?: string) {
        return path.join(this.getTemplateDirectory(), `variability-inputs.${id || this.getVariabilityInputsID()}.yaml`)
    }

    loadVariabilityInputs() {
        return files.loadYAML<InputAssignmentMap>(this.getVariabilityInputs())
    }

    getVariabilityInputsID() {
        const id = Math.max(
            ...files
                .listFiles(this.getTemplateDirectory())
                .map(file => file.match(/^variability-inputs\.(?<id>\d+)\.yaml$/)?.groups?.id)
                .filter(Boolean)
                .map(Number)
        )
        if (id === -Infinity) throw new Error('Did not find a variability inputs')
        return id.toString()
    }

    async setVariabilityInputs(inputs: InputAssignmentMap | string, id?: string) {
        const target = this.getVariabilityInputs(id || utils.getTime())
        if (validator.isString(inputs)) {
            if (inputs.endsWith('.xml')) return files.storeYAML(target, await featureIDE.loadConfiguration(inputs))
            return files.copy(inputs, target)
        }
        files.storeYAML(target, inputs)
    }
}
