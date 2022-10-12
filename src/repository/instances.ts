import * as path from 'path'
import config from '../cli/config'
import * as files from '../utils/files'
import {ServiceTemplate} from '../specification/service-template'
import {Template} from './templates'
import {Opera} from '../orchestrators/opera';
import {Orchestrators} from './orchestrators';
import _ from 'lodash';

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
        files.copy(path, this.getServiceInputPath())
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
     * Merges the attributes of this instance into its service template and returns the result
     */
    getTemplateWithAttributes(): ServiceTemplate {
        let instanceData: Object = {}
        const template = this.getServiceTemplate()
        switch(Orchestrators.getConfig().enabled) {
            case 'opera':
            case 'opera-wsl':
                instanceData = Opera.getAttributes(this)
                break
            default:
                throw new Error('Error: Querying instance data is only supported when using Opera at the moment. ')
        }
        if (template.topology_template?.node_templates) {
            template.topology_template.node_templates = _.merge(template.topology_template.node_templates, instanceData)
        }
        return template
    }

    hasServiceInput() {
        return files.exists(this.getServiceInputPath())
    }

    getServiceInputPath() {
        return path.join(this.getInstanceDirectory(), 'service-inputs.yaml')
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
        return files.loadFile<ServiceTemplate>(this.getServiceTemplatePath())
    }

    getVariableServiceTemplatePath() {
        return path.join(this.getTemplateDirectory(), 'variable-service-template.yaml')
    }

    getVariableServiceTemplate() {
        return files.loadFile<ServiceTemplate>(this.getVariableServiceTemplatePath())
    }
}
