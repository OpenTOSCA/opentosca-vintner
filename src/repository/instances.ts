import * as path from 'path'
import config from '#config'
import * as files from '#files'
import {ServiceTemplate} from '#spec/service-template'
import {Template} from './templates'
import {Orchestrators} from './orchestrators'
import _ from 'lodash'
import {InputAssignmentMap} from '#spec/topology-template'

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
        files.copy(path, this.getServiceInputsPath())
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
        const template = this.getServiceTemplate()
        const attributes = Orchestrators.getOrchestrator().getAttributes(this)
        const inputs = this.hasServiceInputs() ? this.getServiceInputs() : {}
        if (template.topology_template?.node_templates) {
            template.topology_template.node_templates = _.merge(template.topology_template.node_templates, attributes)
        }
        _.set(template, 'topology_template.inputs', inputs)
        return template
    }

    hasServiceInputs() {
        return files.exists(this.getServiceInputsPath())
    }

    getServiceInputsPath() {
        return path.join(this.getInstanceDirectory(), 'service-inputs.yaml')
    }

    getServiceInputs() {
        return files.loadYAML<InputAssignmentMap>(this.getServiceInputsPath())
    }

    generateServiceTemplatePath() {
        return this.getServiceTemplatePath(new Date().getTime().toString())
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

    getServiceTemplatePath(id?: string) {
        return path.join(this.getTemplateDirectory(), this.getServiceTemplateFile(id))
    }

    getServiceTemplate() {
        return files.loadYAML<ServiceTemplate>(this.getServiceTemplatePath())
    }

    getVariableServiceTemplatePath() {
        return path.join(this.getTemplateDirectory(), 'variable-service-template.yaml')
    }

    getVariableServiceTemplate() {
        return files.loadYAML<ServiceTemplate>(this.getVariableServiceTemplatePath())
    }
}
