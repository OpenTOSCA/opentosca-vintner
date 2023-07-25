import * as check from '#check'
import config from '#config'
import * as files from '#files'
import Plugins from '#plugins'
import {ServiceTemplate} from '#spec/service-template'
import {InputAssignmentMap} from '#spec/topology-template'
import _ from 'lodash'
import * as path from 'path'
import {Template} from './templates'

type InstanceInfo = {
    name: string
    creation_timestamp: number
    resolved_timestamp?: number
    template_timestamp: number
    service_inputs_timestamp?: number
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

    create(template: Template, time: number) {
        // Setup directories
        files.createDirectory(this.getInstanceDirectory())
        files.createDirectory(this.getDataDirectory())
        files.createDirectory(this.getServiceInputsDirectory())
        files.createDirectory(this.getTemplatesDirectory())

        // Create info
        this.setInfo({name: this.getName(), creation_timestamp: time, template_timestamp: time})

        // Set template
        this.setTemplate(template.getName(), time)

        return this
    }

    delete() {
        files.removeDirectory(this.getInstanceDirectory())
        return this
    }

    setTemplate(name: string, time: number) {
        files.copy(new Template(name).getTemplateDirectory(), this.getTemplateDirectory(time))
        this.setInfo({...this.loadInfo(), template_timestamp: time})
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
        const info = files.loadYAML<InstanceInfo>(this.getInfo())

        if (check.isUndefined(info.name)) throw new Error(`${this.getName()} has no name`)
        if (check.isUndefined(info.creation_timestamp)) throw new Error(`${this.getName()} has no creation timestamp`)
        if (check.isUndefined(info.template_timestamp)) throw new Error(`${this.getName()} has no template timestamp`)

        return info
    }

    setResolvedTimestamp(time: number) {
        this.setInfo({...this.loadInfo(), resolved_timestamp: time})
        return this
    }

    loadResolvedTimestamp() {
        const info = this.loadInfo()
        if (check.isUndefined(info.resolved_timestamp))
            throw new Error(`Instance "${this.getName()}" does not have a service template`)
        return info.resolved_timestamp
    }

    loadServiceInputsTimestamp() {
        return this.loadInfo().service_inputs_timestamp
    }

    getInstanceDirectory() {
        return path.join(Instances.getInstancesDirectory(), this.getName())
    }

    getTemplateDirectory(time?: number) {
        if (check.isUndefined(time)) time = this.loadInfo().template_timestamp
        return path.join(this.getTemplatesDirectory(), time.toString())
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

    setServiceInputs(path: string, time: number) {
        files.copy(path, this.getServiceInputs(time))
        this.setInfo({...this.loadInfo(), service_inputs_timestamp: time})
        return this
    }

    hasServiceInputs() {
        const time = this.loadServiceInputsTimestamp()
        if (check.isDefined(time)) files.assertFile(this.getServiceInputs(time))
        return check.isDefined(time)
    }

    getServiceInputs(time?: number) {
        if (check.isUndefined(time)) time = this.loadInfo().service_inputs_timestamp
        return path.join(this.getServiceInputsDirectory(), `${time}.yaml`)
    }

    getServiceInputsDirectory() {
        return path.join(this.getInstanceDirectory(), 'service-inputs')
    }

    loadServiceInputs() {
        return files.loadYAML<InputAssignmentMap>(this.getServiceInputs())
    }

    getServiceTemplateFile(time?: number) {
        return `service-template.${time || this.loadResolvedTimestamp()}.yaml`
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
        return path.join(this.getTemplateDirectory(), `variability-inputs.${time || this.loadResolvedTimestamp()}.yaml`)
    }

    loadVariabilityInputs() {
        return files.loadYAML<InputAssignmentMap>(this.getVariabilityInputs())
    }

    async setVariabilityInputs(inputs: InputAssignmentMap, time: number) {
        const target = this.getVariabilityInputs(time)
        files.storeYAML(target, inputs)
    }
}
