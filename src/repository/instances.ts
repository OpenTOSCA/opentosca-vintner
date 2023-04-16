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

type InstanceInfo = {
    name: string
    time?: number
    template: string
}

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

    getLockKey() {
        return 'instances:' + this.getName()
    }

    exists() {
        return files.exists(this.getInstanceDirectory())
    }

    create(template: Template) {
        files.createDirectory(this.getInstanceDirectory())
        files.createDirectory(this.getDataDirectory())
        this.setInfo({name: this.getName(), template: template.getName()})
        this.setTemplate(template.getName(), false)
        return this
    }

    delete() {
        files.removeDirectory(this.getInstanceDirectory())
        return this
    }

    setTemplate(name: string, info = true) {
        files.copy(new Template(name).getTemplateDirectory(), this.getTemplateDirectory(name))
        if (info) this.setInfo({...this.loadInfo(), template: name})
        return this
    }

    getInfo() {
        return path.join(this.getInstanceDirectory(), 'info.yaml')
    }

    setInfo(info: InstanceInfo) {
        files.storeYAML(this.getInfo(), info)
        return this
    }

    loadInfo() {
        return files.loadYAML<InstanceInfo>(this.getInfo())
    }

    setTime(time: number) {
        this.setInfo({...this.loadInfo(), time})
        return this
    }

    setServiceInputs(path: string) {
        files.copy(path, this.getServiceInputs())
        return this
    }

    getInstanceDirectory() {
        return path.join(Instances.getInstancesDirectory(), this._name)
    }

    getTemplateDirectory(template?: string) {
        let name

        if (validator.isDefined(template)) name = template
        if (validator.isUndefined(name)) name = this.loadInfo().template
        if (validator.isUndefined(name)) throw new Error(`${this._name} has no template`)

        return path.join(this.getTemplatesDirectory(), name)
    }

    getTemplatesDirectory() {
        return path.join(this.getInstanceDirectory(), 'templates')
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

    loadTime() {
        const info = this.loadInfo()
        if (validator.isUndefined(info.time))
            throw new Error(`Instance "${this.getName()}" does not a service template`)
        return info.time
    }

    getServiceTemplateFile(time?: number) {
        return `service-template.${time || this.loadTime()}.yaml`
    }

    getServiceTemplate(time?: number) {
        return path.join(this.getTemplateDirectory(), this.getServiceTemplateFile(time))
    }

    loadServiceTemplate() {
        return files.loadYAML<ServiceTemplate>(this.getServiceTemplate())
    }

    setServiceTemplate(template: ServiceTemplate, time: number) {
        files.storeYAML(this.getServiceTemplate(time), template)
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

    getVariabilityInputs(time?: number) {
        return path.join(this.getTemplateDirectory(), `variability-inputs.${time || this.loadTime()}.yaml`)
    }

    loadVariabilityInputs() {
        return files.loadYAML<InputAssignmentMap>(this.getVariabilityInputs())
    }

    async setVariabilityInputs(inputs: InputAssignmentMap, time: number) {
        const target = this.getVariabilityInputs(time)
        files.storeYAML(target, inputs)
    }
}
